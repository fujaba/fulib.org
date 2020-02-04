package org.fulib.webapp.mongo;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Indexes;
import com.mongodb.client.model.ReplaceOptions;
import com.mongodb.client.model.Sorts;
import org.bson.Document;
import org.bson.codecs.configuration.CodecProvider;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.Convention;
import org.bson.codecs.pojo.Conventions;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.fulib.webapp.WebService;
import org.fulib.webapp.assignment.model.Assignment;
import org.fulib.webapp.assignment.model.Comment;
import org.fulib.webapp.assignment.model.Solution;
import org.fulib.webapp.assignment.model.TaskGrading;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.bson.codecs.configuration.CodecRegistries.fromProviders;
import static org.bson.codecs.configuration.CodecRegistries.fromRegistries;

public class Mongo
{
	// =============== Constants ===============

	public static final String PASSWORD_ENV_KEY = "FULIB_ORG_MONGODB_PASSWORD";
	public static final String HOST_ENV_KEY = "FULIB_ORG_MONGODB_HOST";
	public static final String USER_ENV_KEY = "FULIB_ORG_MONGODB_USER";

	public static final String DATABASE_NAME = "fulib-org";

	public static final String LOG_COLLECTION_NAME = "request-log";
	public static final String ASSIGNMENT_COLLECTION_NAME = "assignments";
	public static final String SOLUTION_COLLECTION_NAME = "solutions";
	public static final String COMMENT_COLLECTION_NAME = "comments";
	public static final String ASSIGNEE_COLLECTION_NAME = "assignee";
	public static final String CORRECTION_COLLECTION_NAME = "corrections";

	// =============== Static Fields ===============

	private static final Mongo instance = new Mongo();

	// =============== Fields ===============

	private MongoClient mongoClient;
	private MongoDatabase database;

	private MongoCollection<Document> requestLog;
	private MongoCollection<Assignment> assignments;
	private MongoCollection<Solution> solutions;
	private MongoCollection<Comment> comments;
	private MongoCollection<Document> assignees;
	private MongoCollection<TaskGrading> gradings;

	private final List<Convention> conventions;

	{
		this.conventions = new ArrayList<>(Conventions.DEFAULT_CONVENTIONS);
		this.conventions.add(Conventions.USE_GETTERS_FOR_SETTERS); // to use get<List>().add(...) instead of set<List>()
	}

	private final CodecProvider pojoCodecProvider = PojoCodecProvider.builder()
	                                                                 .register(Assignment.class.getPackage().getName())
	                                                                 .conventions(this.conventions)
	                                                                 .build();

	private final CodecRegistry pojoCodecRegistry = fromRegistries(MongoClientSettings.getDefaultCodecRegistry(),
	                                                               fromProviders(this.pojoCodecProvider));

	// =============== Static Methods ===============

	public static Mongo get()
	{
		return instance;
	}

	// =============== Constructors ===============

	private Mongo()
	{
		final String url = getURL();
		if (url == null)
		{
			return;
		}

		final ConnectionString connString = new ConnectionString(url);
		final MongoClientSettings settings = MongoClientSettings.builder()
		                                                        .applyConnectionString(connString)
		                                                        .retryWrites(true)
		                                                        .build();
		this.mongoClient = MongoClients.create(settings);
		this.database = this.mongoClient.getDatabase(DATABASE_NAME);
		this.requestLog = this.database.getCollection(LOG_COLLECTION_NAME);

		this.assignments = this.database.getCollection(ASSIGNMENT_COLLECTION_NAME, Assignment.class)
		                                .withCodecRegistry(this.pojoCodecRegistry);
		this.assignments.createIndex(Indexes.ascending(Assignment.PROPERTY_id));

		this.solutions = this.database.getCollection(SOLUTION_COLLECTION_NAME, Solution.class)
		                              .withCodecRegistry(this.pojoCodecRegistry);
		this.solutions.createIndex(Indexes.ascending(Solution.PROPERTY_id));
		this.solutions.createIndex(Indexes.ascending(Solution.PROPERTY_assignment));
		this.solutions.createIndex(Indexes.ascending(Solution.PROPERTY_timeStamp));

		this.comments = this.database.getCollection(COMMENT_COLLECTION_NAME, Comment.class)
		                             .withCodecRegistry(this.pojoCodecRegistry);
		this.comments.createIndex(Indexes.ascending(Comment.PROPERTY_id));
		this.comments.createIndex(Indexes.ascending(Comment.PROPERTY_parent));
		this.comments.createIndex(Indexes.ascending(Comment.PROPERTY_timeStamp));

		this.assignees = this.database.getCollection(ASSIGNEE_COLLECTION_NAME);
		this.assignees.createIndex(Indexes.ascending(Solution.PROPERTY_id));
		this.assignees.createIndex(Indexes.ascending(Solution.PROPERTY_assignee));

		this.gradings = this.database.getCollection(CORRECTION_COLLECTION_NAME, TaskGrading.class)
		                             .withCodecRegistry(this.pojoCodecRegistry);
		this.gradings.createIndex(Indexes.ascending(TaskGrading.PROPERTY_solutionID));
		this.gradings.createIndex(Indexes.ascending(TaskGrading.PROPERTY_taskID));
		this.gradings.createIndex(Indexes.ascending(TaskGrading.PROPERTY_timeStamp));
	}

	private static String getURL()
	{
		final String host = System.getenv(HOST_ENV_KEY);
		if (host == null || host.isEmpty())
		{
			return null;
		}

		final String user = System.getenv(USER_ENV_KEY);
		if (user == null || user.isEmpty())
		{
			return null;
		}

		final String password = System.getenv(PASSWORD_ENV_KEY);
		if (password == null || password.isEmpty())
		{
			return null;
		}

		return "mongodb://" + user + ":" + password + "@" + host;
	}

	// =============== Methods ===============

	// --------------- Logging ---------------

	public void log(String ip, String userAgent, String request, String response)
	{
		if (this.requestLog == null)
		{
			return;
		}

		final Document document = new Document();
		document.put("timestamp", new Date());
		document.put("ip", ip);
		document.put("userAgent", userAgent);

		if (WebService.VERSION != null)
		{
			final Document versions = new Document();
			versions.put("webapp", WebService.VERSION);
			versions.put("fulibScenarios", WebService.FULIB_SCENARIOS_VERSION);
			versions.put("fulibMockups", WebService.FULIB_MOCKUPS_VERSION);
			document.put("versions", versions);
		}

		document.put("request", Document.parse(request));
		document.put("response", Document.parse(response));

		this.requestLog.insertOne(document);
	}

	// --------------- Assignments ---------------

	public Assignment getAssignment(String id)
	{
		return this.assignments.find(Filters.eq(Assignment.PROPERTY_id, id)).first();
	}

	public void saveAssignment(Assignment assignment)
	{
		upsert(this.assignments, assignment, Assignment.PROPERTY_id, assignment.getID());
	}

	// --------------- Solutions ---------------

	public Solution getSolution(String id)
	{
		final Solution solution = this.solutions.find(Filters.eq(Solution.PROPERTY_id, id)).first();
		if (solution == null)
		{
			return null;
		}

		return this.resolveAssignment(solution);
	}

	public List<Solution> getSolutions(String assignmentID)
	{
		return this.solutions.find(Filters.eq(Solution.PROPERTY_assignment, assignmentID))
		                     .sort(Sorts.ascending(Solution.PROPERTY_timeStamp))
		                     .map(this::resolveAssignment)
		                     .into(new ArrayList<>());
	}

	private Solution resolveAssignment(Solution solution)
	{
		// workaround, see Solution#setAssignmentID
		final String assignmentID = solution.getAssignmentID();
		final Assignment assignment = this.getAssignment(assignmentID);
		solution.setAssignment(assignment);
		return solution;
	}

	public void saveSolution(Solution solution)
	{
		upsert(this.solutions, solution, Solution.PROPERTY_id, solution.getID());
	}

	public String getAssignee(String solutionID)
	{
		final Document doc = this.assignees.find(Filters.eq(Solution.PROPERTY_id, solutionID)).first();
		return doc != null ? doc.getString(Solution.PROPERTY_assignee) : null;
	}

	public void saveAssignee(String solutionID, String assignee)
	{
		final Document doc = new Document();
		doc.put(Solution.PROPERTY_id, solutionID);
		doc.put(Solution.PROPERTY_assignee, assignee);
		upsert(this.assignees, doc, Solution.PROPERTY_id);
	}

	// --------------- Comments ---------------

	public Comment getComment(String id)
	{
		return this.comments.find(Filters.eq(Comment.PROPERTY_id, id)).first();
	}

	public List<Comment> getComments(String parent)
	{
		return this.comments.find(Filters.eq(Comment.PROPERTY_parent, parent))
		                    .sort(Sorts.ascending(Comment.PROPERTY_timeStamp))
		                    .into(new ArrayList<>());
	}

	public void saveComment(Comment comment)
	{
		upsert(this.comments, comment, Comment.PROPERTY_id, comment.getID());
	}

	private static Document comment2Doc(Comment comment)
	{
		final Document doc = new Document();
		doc.put(Comment.PROPERTY_id, comment.getID());
		doc.put(Comment.PROPERTY_parent, comment.getParent());
		doc.put(Comment.PROPERTY_timeStamp, comment.getTimeStamp());
		doc.put(Comment.PROPERTY_author, comment.getAuthor());
		doc.put(Comment.PROPERTY_email, comment.getEmail());
		doc.put(Comment.PROPERTY_markdown, comment.getMarkdown());
		doc.put(Comment.PROPERTY_html, comment.getHtml());
		return doc;
	}

	// --------------- Grading ---------------

	public List<TaskGrading> getGradingHistory(String solutionID)
	{
		return this.gradings.find(Filters.eq(TaskGrading.PROPERTY_solutionID, solutionID))
		                    .sort(Sorts.ascending(TaskGrading.PROPERTY_timeStamp))
		                    .into(new ArrayList<>());
	}

	public void addGrading(TaskGrading grading)
	{
		this.gradings.insertOne(grading);
	}

	// --------------- Helpers ---------------

	private static void upsert(MongoCollection<Document> collection, Document doc, String idProperty)
	{
		upsert(collection, doc, idProperty, doc.getString(idProperty));
	}

	private static <T> void upsert(MongoCollection<T> collection, T doc, String idPropertyName, Object idPropertyValue)
	{
		collection.replaceOne(Filters.eq(idPropertyName, idPropertyValue), doc, new ReplaceOptions().upsert(true));
	}
}
