package org.fulib.webapp.projects.mongo;

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
import org.bson.BsonValue;
import org.bson.codecs.configuration.CodecProvider;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.Convention;
import org.bson.codecs.pojo.Conventions;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.fulib.webapp.projects.model.Container;
import org.fulib.webapp.projects.model.Project;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

import static org.bson.codecs.configuration.CodecRegistries.fromProviders;
import static org.bson.codecs.configuration.CodecRegistries.fromRegistries;

public class Mongo
{
	// =============== Constants ===============

	public static final String DATABASE_NAME = "fulib-org";

	public static final String PROJECT_COLLECTION_NAME = "projects";
	public static final String FILES_COLLECTION_NAME = "projectFiles";

	// =============== Fields ===============

	private MongoCollection<Project> projects;
	private MongoCollection<Container> containers;
	private GridFSBucket projectFilesFS;

	// =============== Constructors ===============

	public Mongo(String url)
	{
		if (url == null)
		{
			return;
		}

		// Basic DB Settings

		final ConnectionString connString = new ConnectionString(url);
		final MongoClientSettings settings = MongoClientSettings
			.builder()
			.applyConnectionString(connString)
			.retryWrites(true)
			.build();
		MongoClient mongoClient = MongoClients.create(settings);
		MongoDatabase database = mongoClient.getDatabase(DATABASE_NAME);

		// POJO Codecs

		List<Convention> conventions = new ArrayList<>(Conventions.DEFAULT_CONVENTIONS);
		conventions.add(Conventions.USE_GETTERS_FOR_SETTERS); // to use get<List>().add(...) instead of set<List>()

		CodecProvider pojoCodecProvider = PojoCodecProvider
			.builder()
			.register(Project.class.getPackage().getName())
			.conventions(conventions)
			.build();
		CodecRegistry pojoCodecRegistry = fromRegistries(MongoClientSettings.getDefaultCodecRegistry(),
		                                                 fromProviders(pojoCodecProvider));

		// Collections

		this.projects = database
			.getCollection(PROJECT_COLLECTION_NAME, Project.class)
			.withCodecRegistry(pojoCodecRegistry);
		this.projects.createIndex(Indexes.ascending(Project.PROPERTY_ID));
		this.projects.createIndex(Indexes.ascending(Project.PROPERTY_USER_ID));
		this.projects.createIndex(Indexes.ascending(Project.PROPERTY_NAME));

		this.projectFilesFS = GridFSBuckets.create(database, FILES_COLLECTION_NAME);
	}

	// =============== Methods ===============

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

	// --------------- Helpers ---------------

	private static <T> void upsert(MongoCollection<T> collection, T doc, String idPropertyName, Object idPropertyValue)
	{
		collection.replaceOne(Filters.eq(idPropertyName, idPropertyValue), doc, new ReplaceOptions().upsert(true));
	}
}
