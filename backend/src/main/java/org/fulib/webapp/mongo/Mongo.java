package org.fulib.webapp.mongo;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Indexes;
import com.mongodb.client.model.ReplaceOptions;
import com.mongodb.client.model.Sorts;
import org.bson.BsonValue;
import org.bson.Document;
import org.bson.codecs.configuration.CodecProvider;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.Convention;
import org.bson.codecs.pojo.Conventions;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.fulib.webapp.WebService;
import org.fulib.webapp.assignment.model.*;
import org.fulib.webapp.projects.model.Container;
import org.fulib.webapp.projects.model.Project;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static org.bson.codecs.configuration.CodecRegistries.fromProviders;
import static org.bson.codecs.configuration.CodecRegistries.fromRegistries;

public class Mongo
{
	// =============== Constants ===============

	public static final String DATABASE_NAME = "fulib-org";

	public static final String LOG_COLLECTION_NAME = "request-log";
	public static final String PROJECT_COLLECTION_NAME = "projects";
	public static final String CONTAINER_COLLECTION_NAME = "projectContainers";
	public static final String PROJECT_FILES_COLLECTION_NAME = "projectFiles";
	public static final String ASSIGNMENT_COLLECTION_NAME = "assignments";
	public static final String COURSE_COLLECTION_NAME = "courses";
	public static final String SOLUTION_COLLECTION_NAME = "solutions";
	public static final String COMMENT_COLLECTION_NAME = "comments";
	public static final String ASSIGNEE_COLLECTION_NAME = "assignee";
	public static final String GRADING_COLLECTION_NAME = "gradings";

	private static final Document VERSIONS = new Document();

	static
	{
		for (final Map.Entry<Object, Object> entry : WebService.VERSIONS.entrySet())
		{
			String key = entry.getKey().toString();
			if ("fulib.org".equals(key))
			{
				// for legacy reasons and also because "fulib.org" is not a valid Bson key
				key = "webapp";
			}
			VERSIONS.put(key, entry.getValue().toString());
		}
	}

	// =============== Fields ===============

	private MongoClient mongoClient;
	private MongoDatabase database;

	MongoCollection<Document> requestLog;
	private MongoCollection<Project> projects;
	private MongoCollection<Container> containers;
	private GridFSBucket projectFilesFS;
	private MongoCollection<Assignment> assignments;
	private MongoCollection<Course> courses;
	private MongoCollection<Solution> solutions;
	private MongoCollection<Comment> comments;
	private MongoCollection<Document> assignees;
	private MongoCollection<TaskGrading> gradings;

	private final List<Convention> conventions;

	{
		this.conventions = new ArrayList<>(Conventions.DEFAULT_CONVENTIONS);
		this.conventions.add(Conventions.USE_GETTERS_FOR_SETTERS); // to use get<List>().add(...) instead of set<List>()
	}

	private final CodecProvider pojoCodecProvider = PojoCodecProvider
		.builder()
		.register(Assignment.class.getPackage().getName(), Project.class.getPackage().getName())
		.conventions(this.conventions)
		.build();

	private final CodecRegistry pojoCodecRegistry = fromRegistries(MongoClientSettings.getDefaultCodecRegistry(),
	                                                               fromProviders(this.pojoCodecProvider));

	// =============== Constructors ===============

	public Mongo(String url)
	{
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

		this.projects = this.database
			.getCollection(PROJECT_COLLECTION_NAME, Project.class)
			.withCodecRegistry(this.pojoCodecRegistry);
		this.projects.createIndex(Indexes.ascending(Project.PROPERTY_ID));
		this.projects.createIndex(Indexes.ascending(Project.PROPERTY_USER_ID));
		this.projects.createIndex(Indexes.ascending(Project.PROPERTY_NAME));

		this.containers = this.database
			.getCollection(CONTAINER_COLLECTION_NAME, Container.class)
			.withCodecRegistry(this.pojoCodecRegistry);
		this.containers.createIndex(Indexes.ascending(Container.PROPERTY_ID));
		this.containers.createIndex(Indexes.ascending(Container.PROPERTY_PROJECT_ID));

		this.projectFilesFS = GridFSBuckets.create(this.database, PROJECT_FILES_COLLECTION_NAME);

		this.assignments = this.database.getCollection(ASSIGNMENT_COLLECTION_NAME, Assignment.class)
		                                .withCodecRegistry(this.pojoCodecRegistry);
		this.assignments.createIndex(Indexes.ascending(Assignment.PROPERTY_id));
		this.assignments.createIndex(Indexes.ascending(Assignment.PROPERTY_userId));

		this.courses = this.database.getCollection(COURSE_COLLECTION_NAME, Course.class)
		                            .withCodecRegistry(this.pojoCodecRegistry);
		this.courses.createIndex(Indexes.ascending(Course.PROPERTY_id));

		this.solutions = this.database.getCollection(SOLUTION_COLLECTION_NAME, Solution.class)
		                              .withCodecRegistry(this.pojoCodecRegistry);
		this.solutions.createIndex(Indexes.ascending(Solution.PROPERTY_id));
		this.solutions.createIndex(Indexes.ascending(Solution.PROPERTY_userId));
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

		this.gradings = this.database.getCollection(GRADING_COLLECTION_NAME, TaskGrading.class)
		                             .withCodecRegistry(this.pojoCodecRegistry);
		this.gradings.createIndex(Indexes.ascending(TaskGrading.PROPERTY_solutionID));
		this.gradings.createIndex(Indexes.ascending(TaskGrading.PROPERTY_taskID));
		this.gradings.createIndex(Indexes.ascending(TaskGrading.PROPERTY_timeStamp));
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
		document.put("versions", VERSIONS);

		document.put("request", Document.parse(request));
		document.put("response", Document.parse(response));

		this.requestLog.insertOne(document);
	}

	// --------------- Projects ---------------

	public Project getProject(String id)
	{
		return this.projects.find(Filters.eq(Project.PROPERTY_ID, id)).first();
	}

	public List<Project> getProjectsByUser(String user)
	{
		return this.projects.find(Filters.eq(Project.PROPERTY_USER_ID, user)).into(new ArrayList<>());
	}

	public void saveProject(Project project)
	{
		upsert(this.projects, project, Project.PROPERTY_ID, project.getId());
	}

	public void deleteProject(String id)
	{
		this.projects.deleteOne(Filters.eq(Project.PROPERTY_ID, id));
	}

	// --------------- Containers ---------------

	public Container getContainerForProject(String projectId)
	{
		return this.containers.find(Filters.eq(Container.PROPERTY_PROJECT_ID, projectId)).first();
	}

	public void saveContainer(Container container)
	{
		upsert(this.containers, container, Container.PROPERTY_ID, container.getId());
	}

	public void deleteContainer(String id)
	{
		this.containers.deleteOne(Filters.eq(Container.PROPERTY_ID, id));
	}

	// --------------- Files ---------------

	public InputStream downloadFile(String name)
	{
		return this.projectFilesFS.openDownloadStream(name);
	}

	public OutputStream uploadFile(String name)
	{
		return this.projectFilesFS.openUploadStream(name);
	}

	public void deleteFile(String name)
	{
		final List<BsonValue> fileIds = this.projectFilesFS
			.find(Filters.eq("filename", name))
			.map(GridFSFile::getId)
			.into(new ArrayList<>());
		for (final BsonValue fileId : fileIds)
		{
			this.projectFilesFS.delete(fileId);
		}
	}

	// --------------- Assignments ---------------

	public Assignment getAssignment(String id)
	{
		return this.assignments.find(Filters.eq(Assignment.PROPERTY_id, id)).first();
	}

	public List<Assignment> getAssignmentsByUser(String userId)
	{
		return this.assignments.find(Filters.eq(Assignment.PROPERTY_userId, userId)).into(new ArrayList<>());
	}

	public void saveAssignment(Assignment assignment)
	{
		upsert(this.assignments, assignment, Assignment.PROPERTY_id, assignment.getID());
	}

	// --------------- Courses ---------------

	public Course getCourse(String id)
	{
		return this.courses.find(Filters.eq(Course.PROPERTY_id, id)).first();
	}

	public List<Course> getCoursesByUser(String userId)
	{
		return this.courses.find(Filters.eq(Course.PROPERTY_userId, userId)).into(new ArrayList<>());
	}

	public void saveCourse(Course course)
	{
		upsert(this.courses, course, Course.PROPERTY_id, course.getId());
	}

	// --------------- Solutions ---------------

	public Solution getSolution(String id)
	{
		final Solution solution = this.solutions.find(Filters.eq(Solution.PROPERTY_id, id)).first();
		if (solution == null)
		{
			return null;
		}

		return this.resolve(solution);
	}

	public List<Solution> getSolutions(String assignmentID)
	{
		return this.solutions.find(Filters.eq(Solution.PROPERTY_assignment, assignmentID))
		                     .sort(Sorts.ascending(Solution.PROPERTY_timeStamp))
		                     .map(this::resolve)
		                     .into(new ArrayList<>());
	}

	public List<Solution> getSolutionsByUser(String userId)
	{
		return this.solutions
			.find(Filters.eq(Solution.PROPERTY_userId, userId))
			.sort(Sorts.ascending(Solution.PROPERTY_assignment, Solution.PROPERTY_timeStamp))
			.map(this::resolve)
			.into(new ArrayList<>());
	}

	private Solution resolve(Solution solution)
	{
		solution.setAssignee(this.getAssignee(solution.getID()));
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
