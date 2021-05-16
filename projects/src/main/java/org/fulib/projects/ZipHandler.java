package org.fulib.projects;

import org.eclipse.jetty.http.HttpStatus;
import spark.Request;
import spark.Response;
import spark.Spark;
import spark.utils.IOUtils;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.nio.file.attribute.FileAttribute;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

public class ZipHandler
{
	public Object unpack(Request request, Response response) throws IOException
	{
		final Path root = getPath(request);
		try (final ZipInputStream zipInput = new ZipInputStream(request.raw().getInputStream()))
		{
			ZipEntry entry;
			while ((entry = zipInput.getNextEntry()) != null)
			{
				create(root, entry, zipInput);
			}
		}
		return "";
	}

	private void create(Path root, ZipEntry entry, InputStream content) throws IOException
	{
		final Path subPath = root.resolve(entry.getName());
		if (entry.isDirectory())
		{
			Files.createDirectories(subPath);
			return;
		}

		Files.createDirectories(subPath.getParent());
		Files.copy(content, subPath);
		Files.setLastModifiedTime(subPath, entry.getLastModifiedTime());
	}

	public Object pack(Request request, Response response) throws IOException
	{
		final Path root = getPath(request);

		try (
			final ZipOutputStream zipOutput = new ZipOutputStream(response.raw().getOutputStream(),
			                                                      StandardCharsets.UTF_8)
		)
		{
			Files.walkFileTree(root, new SimpleFileVisitor<Path>()
			{
				private void createEntry(Path dir, BasicFileAttributes attrs) throws IOException
				{
					String relativePath = root.relativize(dir).toString();
					if (attrs.isDirectory())
					{
						relativePath += "/";
					}
					final ZipEntry entry = new ZipEntry(relativePath);
					entry.setSize(attrs.size());
					entry.setCreationTime(attrs.creationTime());
					entry.setLastModifiedTime(attrs.lastModifiedTime());
					entry.setLastAccessTime(attrs.lastAccessTime());
					zipOutput.putNextEntry(entry);
				}

				@Override
				public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException
				{
					createEntry(dir, attrs);
					zipOutput.closeEntry();
					return FileVisitResult.CONTINUE;
				}

				@Override
				public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException
				{
					createEntry(file, attrs);
					try (final InputStream input = Files.newInputStream(file))
					{
						IOUtils.copyLarge(input, zipOutput);
					}
					zipOutput.closeEntry();
					return FileVisitResult.CONTINUE;
				}
			});
			zipOutput.finish();
		}

		return "";
	}

	private Path getPath(Request request)
	{
		final String pathInfo = request.pathInfo();
		final String path = pathInfo.substring("/zip".length());
		final Path root = Paths.get(path);

		if (!Files.isDirectory(root))
		{
			throw Spark.halt(HttpStatus.BAD_REQUEST_400, "{\"error\": \"path be a directory\"}\n");
		}
		return root;
	}
}
