package org.fulib.scenarios.mongo;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

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

		if (password != null)
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

	public void log(String request, String response)
	{
		if (this.coll == null)
		{
			return;
		}

		final Document document = new Document();
		document.put("timestamp", new Date());
		document.put("request", Document.parse(request));
		document.put("response", Document.parse(response));

		this.coll.insertOne(document);
	}
}
