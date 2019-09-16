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

	public static final String PASSWORD_ENV_KEY = "fulib_org_mongo";
	public static final String SERVER           = "avocado.uniks.de";
	public static final String PORT             = "38128";
	public static final String USER             = "seadmin";
	public static final String DATABASE_NAME    = "fulib-org";
	public static final String COLLECTION_NAME  = "request-log";

	// =============== Static Fields ===============

	private static Mongo theMongo = null;

	// =============== Fields ===============

	private MongoClient               mongoClient = null;
	private MongoDatabase             database    = null;
	private MongoCollection<Document> coll        = null;

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
		final String password = System.getenv(PASSWORD_ENV_KEY);

		if (password != null && !password.isEmpty())
		{
			ConnectionString connString = new ConnectionString(
				"mongodb://" + USER + ":" + password + "@" + SERVER + ":" + PORT);
			MongoClientSettings settings = MongoClientSettings.builder().applyConnectionString(connString)
			                                                  .retryWrites(true).build();
			this.mongoClient = MongoClients.create(settings);
			this.database = this.mongoClient.getDatabase(DATABASE_NAME);
			this.coll = this.database.getCollection(COLLECTION_NAME);
		}
	}

	// =============== Methods ===============

	public void log(String ip, String userAgent, String request, String response)
	{
		if (this.coll == null)
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

		this.coll.insertOne(document);
	}
}
