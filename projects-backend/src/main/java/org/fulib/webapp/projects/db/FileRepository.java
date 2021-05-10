package org.fulib.webapp.projects.db;

import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.model.Filters;
import org.bson.BsonValue;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

public class FileRepository
{
	public static final String FILES_COLLECTION_NAME = "projectFiles";

	private final GridFSBucket projectFilesFS;

	public FileRepository(Mongo mongo)
	{
		this.projectFilesFS = GridFSBuckets.create(mongo.getDatabase(), FILES_COLLECTION_NAME);
	}

	public InputStream download(String name)
	{
		return this.projectFilesFS.openDownloadStream(name);
	}

	public OutputStream upload(String name)
	{
		return this.projectFilesFS.openUploadStream(name);
	}

	public void delete(String name)
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
}
