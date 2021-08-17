package org.fulib.webapp.projects.db;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.bson.codecs.configuration.CodecProvider;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.Convention;
import org.bson.codecs.pojo.Conventions;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.fulib.webapp.projects.members.Member;
import org.fulib.webapp.projects.projects.Project;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;

import static org.bson.codecs.configuration.CodecRegistries.fromProviders;
import static org.bson.codecs.configuration.CodecRegistries.fromRegistries;

public class Mongo
{
	public static final String DATABASE_NAME = "fulib-org";

	private final MongoDatabase database;
	private final CodecRegistry codecRegistry;

	@Inject
	public Mongo()
	{
		// Basic DB Settings

		final ConnectionString connString = new ConnectionString(System.getenv("FULIB_MONGO_URL"));
		final MongoClientSettings settings = MongoClientSettings
			.builder()
			.applyConnectionString(connString)
			.retryWrites(true)
			.build();
		MongoClient mongoClient = MongoClients.create(settings);
		database = mongoClient.getDatabase(DATABASE_NAME);

		// POJO Codecs

		List<Convention> conventions = new ArrayList<>(Conventions.DEFAULT_CONVENTIONS);
		conventions.add(Conventions.USE_GETTERS_FOR_SETTERS); // to use get<List>().add(...) instead of set<List>()

		CodecProvider pojoCodecProvider = PojoCodecProvider
			.builder()
			.register(Project.class.getPackage().getName(), Member.class.getPackage().getName())
			.conventions(conventions)
			.build();
		codecRegistry = fromRegistries(MongoClientSettings.getDefaultCodecRegistry(), fromProviders(pojoCodecProvider));
	}

	public MongoDatabase getDatabase()
	{
		return database;
	}

	public CodecRegistry getCodecRegistry()
	{
		return codecRegistry;
	}
}
