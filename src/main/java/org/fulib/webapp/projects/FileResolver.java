package org.fulib.webapp.projects;

import org.fulib.webapp.projects.model.File;
import org.fulib.webapp.tool.IDGenerator;

import java.util.Collection;
import java.util.Map;
import java.util.TreeMap;

public class FileResolver
{
	private final File root;
	private final Map<String, File> files = new TreeMap<>();

	public FileResolver(File root)
	{
		this.root = root;
	}

	public Collection<File> getFiles()
	{
		return this.files.values();
	}

	public File getOrCreate(String name)
	{
		File parent = this.root;
		int index;
		int prevIndex = 0;
		while ((index = name.indexOf('/', prevIndex)) >= 0)
		{
			final String simpleName = name.substring(prevIndex, index);
			final File finalParent = parent;
			parent = this.files.computeIfAbsent(name.substring(0, index),
			                                    s -> this.createFile(finalParent, simpleName, true));
			prevIndex = index + 1;
		}

		final String simpleName = name.substring(prevIndex);
		final File finalParent = parent;
		return this.files.computeIfAbsent(name, s -> this.createFile(finalParent, simpleName, false));
	}

	private File createFile(File parent, String name, boolean directory)
	{
		final String id = IDGenerator.generateID();
		final File file = new File(id);
		file.setName(name);
		file.setDirectory(directory);
		file.setParentId(parent.getId());
		file.setUserId(root.getUserId());
		file.setProjectId(root.getProjectId());
		file.setCreated(root.getCreated());
		return file;
	}
}
