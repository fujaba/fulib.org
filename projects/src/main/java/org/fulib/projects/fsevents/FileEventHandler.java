package org.fulib.projects.fsevents;

public interface FileEventHandler
{
	void modify(String path);

	void create(String path);

	void delete(String path);

	void move(String oldPath, String newPath);
}
