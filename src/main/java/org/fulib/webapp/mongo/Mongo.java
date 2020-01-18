package org.fulib.webapp.mongo;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.ReplaceOptions;
import org.bson.Document;
import org.fulib.webapp.WebService;
import org.fulib.webapp.assignment.model.Assignment;
import org.fulib.webapp.assignment.model.Solution;
import org.fulib.webapp.assignment.model.Task;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Mongo
{
	// =============== Constants ===============

	public static final String PASSWORD_ENV_KEY = "FULIB_ORG_MONGODB_PASSWORD";
	public static final String HOST_ENV_KEY     = "FULIB_ORG_MONGODB_HOST";
	public static final String USER_ENV_KEY     = "FULIB_ORG_MONGODB_USER";

	public static final String DATABASE_NAME = "fulib-org";

	public static final String LOG_COLLECTION_NAME        = "request-log";
	public static final String ASSIGNMENT_COLLECTION_NAME = "assignments";
	public static final String SOLUTION_COLLECTION_NAME   = "solutions";

	// =============== Static Fields ===============

	private static Mongo theMongo = null;

	// =============== Fields ===============

	private MongoClient   mongoClient;
	private MongoDatabase database;

	private MongoCollection<Document> requestLog;
	private MongoCollection<Document> assignments;
	private MongoCollection<Document> solutions;

	// =============== Static Methods ===============

	public static Mongo get()
	{
		if (theMongo == null)
		{
			theMongo = new Mongo();
		}

		return theMongo;
	}

	// =============== Constructors ===============

	public Mongo()
	{
		final String url = getURL();
		if (url == null)
		{
			return;
		}

		final ConnectionString connString = new ConnectionString(url);
		final MongoClientSettings settings = MongoClientSettings.builder().applyConnectionString(connString)
		                                                        .retryWrites(true).build();
		this.mongoClient = MongoClients.create(settings);
		this.database = this.mongoClient.getDatabase(DATABASE_NAME);
		this.requestLog = this.database.getCollection(LOG_COLLECTION_NAME);
		this.assignments = this.database.getCollection(ASSIGNMENT_COLLECTION_NAME);
		this.solutions = this.database.getCollection(SOLUTION_COLLECTION_NAME);
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

	public Assignment getAssignment(String id)
	{
		final Document doc = this.assignments.find(Filters.eq(Assignment.PROPERTY_id, id)).first();
		if (doc == null)
		{
			return null;
		}

		return doc2Assignment(id, doc);
	}

	private static Assignment doc2Assignment(String id, Document doc)
	{
		final Assignment assignment = new Assignment(id);
		assignment.setTitle(doc.getString(Assignment.PROPERTY_title));
		assignment.setDescription(doc.getString(Assignment.PROPERTY_description));
		assignment.setAuthor(doc.getString(Assignment.PROPERTY_author));
		assignment.setEmail(doc.getString(Assignment.PROPERTY_email));
		assignment.setDeadline(ZonedDateTime.parse(doc.getString(Assignment.PROPERTY_deadline)));
		assignment.setSolution(doc.getString(Assignment.PROPERTY_solution));

		for (final Document taskDoc : doc.getList(Assignment.PROPERTY_tasks, Document.class))
		{
			final Task task = new Task();
			task.setDescription(taskDoc.getString(Task.PROPERTY_description));
			task.setPoints(taskDoc.getInteger(Task.PROPERTY_points));
			task.setVerification(taskDoc.getString(Task.PROPERTY_verification));
			assignment.getTasks().add(task);
		}

		return assignment;
	}

	public void saveAssignment(Assignment assignment)
	{
		final Document doc = assignment2Doc(assignment);
		this.assignments
			.replaceOne(Filters.eq(Assignment.PROPERTY_id, assignment.getID()), doc, new ReplaceOptions().upsert(true));
	}

	private static Document assignment2Doc(Assignment assignment)
	{
		final Document doc = new Document();

		doc.put(Assignment.PROPERTY_id, assignment.getID());
		doc.put(Assignment.PROPERTY_title, assignment.getTitle());
		doc.put(Assignment.PROPERTY_description, assignment.getDescription());
		doc.put(Assignment.PROPERTY_author, assignment.getAuthor());
		doc.put(Assignment.PROPERTY_email, assignment.getEmail());
		doc.put(Assignment.PROPERTY_deadline, assignment.getDeadline().toString());
		doc.put(Assignment.PROPERTY_solution, assignment.getSolution());

		final List<Document> tasks = new ArrayList<>();
		for (final Task task : assignment.getTasks())
		{
			final Document taskDoc = new Document();
			taskDoc.put(Task.PROPERTY_description, task.getDescription());
			taskDoc.put(Task.PROPERTY_points, task.getPoints());
			taskDoc.put(Task.PROPERTY_verification, task.getVerification());
			tasks.add(taskDoc);
		}
		doc.put(Assignment.PROPERTY_tasks, tasks);

		return doc;
	}

	public void saveSolution(Solution solution)
	{
		final Document doc = solution2Doc(solution);
		this.solutions
			.replaceOne(Filters.eq(Solution.PROPERTY_id, solution.getID()), doc, new ReplaceOptions().upsert(true));
	}

	private static Document solution2Doc(Solution solution)
	{
		final Document doc = new Document();
		doc.put(Solution.PROPERTY_id, solution.getID());
		doc.put(Solution.PROPERTY_assignment, solution.getAssignment().getID());
		doc.put(Solution.PROPERTY_name, solution.getName());
		doc.put(Solution.PROPERTY_studentID, solution.getStudentID());
		doc.put(Solution.PROPERTY_email, solution.getEmail());
		doc.put(Solution.PROPERTY_solution, solution.getSolution());
		return doc;
	}
}
