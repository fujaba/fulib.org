package org.fulib.webapp.mongo;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.fulib.webapp.WebService;

import java.util.Date;

public class Mongo
{
	// =============== Constants ===============

	public static final String PASSWORD_ENV_KEY = "FULIB_ORG_MONGODB_PASSWORD";
	public static final String HOST_ENV_KEY = "FULIB_ORG_MONGODB_HOST";
	public static final String USER_ENV_KEY = "FULIB_ORG_MONGODB_USER";

	public static final String DATABASE_NAME = "fulib-org";

	public static final String LOG_COLLECTION_NAME = "request-log";

	// =============== Static Fields ===============

	private static final Mongo instance = new Mongo();

	// =============== Fields ===============

	private MongoClient mongoClient;
	private MongoDatabase database;

	private MongoCollection<Document> requestLog;

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
}
