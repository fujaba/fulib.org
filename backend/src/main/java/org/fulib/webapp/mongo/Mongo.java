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
import org.bson.codecs.configuration.CodecProvider;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.Convention;
import org.bson.codecs.pojo.Conventions;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.fulib.webapp.WebService;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static org.bson.codecs.configuration.CodecRegistries.fromProviders;
import static org.bson.codecs.configuration.CodecRegistries.fromRegistries;

public class Mongo
{
	// =============== Constants ===============

	public static final String LOG_COLLECTION_NAME = "request-log";

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
	private final List<Convention> conventions;

	{
		this.conventions = new ArrayList<>(Conventions.DEFAULT_CONVENTIONS);
		this.conventions.add(Conventions.USE_GETTERS_FOR_SETTERS); // to use get<List>().add(...) instead of set<List>()
	}

	private final CodecProvider pojoCodecProvider = PojoCodecProvider.builder().conventions(this.conventions).build();

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
		final MongoClientSettings settings = MongoClientSettings
			.builder()
			.applyConnectionString(connString)
			.retryWrites(true)
			.build();
		this.mongoClient = MongoClients.create(settings);
		this.database = this.mongoClient.getDatabase(connString.getDatabase());
		this.requestLog = this.database.getCollection(LOG_COLLECTION_NAME);
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
