package org.fulib.projects;

public interface FileEventHandler
{
	void modify(String path);

	void createFile(String path);

	void createDirectory(String path);

	void delete(String path);

	void move(String oldPath, String newPath);
}
