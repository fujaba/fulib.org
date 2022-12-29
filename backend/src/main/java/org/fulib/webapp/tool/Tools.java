package org.fulib.webapp.tool;

import org.fulib.mockups.FulibMockups;
import org.fulib.scenarios.tool.ScenarioCompiler;
import org.junit.runner.JUnitCore;
import org.junit.runner.Result;
import org.junit.runner.notification.Failure;

import javax.tools.ToolProvider;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Stream;

public class Tools
{
	// --------------- File Filters ---------------

	public static boolean isJava(Path file)
	{
		return file.toString().endsWith(".java");
	}

	public static boolean isClass(Path file)
	{
		return file.toString().endsWith(".class");
	}

	// --------------- File Utilities ---------------

	public static void deleteRecursively(Path dir)
	{
		try (final Stream<Path> stream = Files.walk(dir))
		{
			stream.sorted(Comparator.reverseOrder()).forEach(file -> {
				try
				{
					Files.deleteIfExists(file);
				}
				catch (IOException ignored)
				{
				}
			});
		}
		catch (IOException ignored)
		{
		}
	}

	// --------------- Tool Invocation ---------------

	public static int scenarioc(
		OutputStream out, OutputStream err, Path scenarioSrcDir, Path modelSrcDir, Path testSrcDir, String... args
	)
	{
		final List<String> finalArgs = new ArrayList<>(8 + args.length);
		finalArgs.add("--classpath");
		finalArgs.add(FulibMockups.class.getProtectionDomain().getCodeSource().getLocation().getPath());
		finalArgs.add("-m");
		finalArgs.add(modelSrcDir.toString());
		finalArgs.add("-t");
		finalArgs.add(testSrcDir.toString());
		finalArgs.add(scenarioSrcDir.toString());
		finalArgs.add("--diagram-handlers=.html.png=import(org.fulib.FulibTools).objectDiagrams().dumpPng(%s, %s)");
		Collections.addAll(finalArgs, args);
		return new ScenarioCompiler().run(null, out, err, finalArgs.toArray(new String[0]));
	}

	public static int javac(String classpath, Path outFolder, Path... sourceFolders) throws IOException
	{
		return javac(null, null, classpath, outFolder, sourceFolders);
	}

	public static int javac(OutputStream out, OutputStream err, String classpath, Path outFolder, Path... sourceFolders)
		throws IOException
	{
		Files.createDirectories(outFolder);

		ArrayList<String> args = new ArrayList<>();

		Arrays.stream(sourceFolders).flatMap(sourceFolder -> {
			try
			{
				// noinspection resource
				return Files.walk(sourceFolder).filter(Tools::isJava);
			}
			catch (IOException e)
			{
				return Stream.empty();
			}
		}).map(Path::toString).forEach(args::add);

		args.add("-d");
		args.add(outFolder.toString());
		if (classpath != null)
		{
			args.add("-classpath");
			args.add(classpath);
		}

		return ToolProvider.getSystemJavaCompiler().run(null, out, err, args.toArray(new String[0]));
	}

	public static Result runTests(Path mainClassesDir, Path testClassesDir)
	{
		URL[] classPathUrls = new URL[0];
		try
		{
			classPathUrls = new URL[] { mainClassesDir.toUri().toURL(), testClassesDir.toUri().toURL() };
		}
		catch (MalformedURLException e)
		{
			Logger.getGlobal().log(Level.SEVERE, "could not build classpath", e);
		}

		List<Class<?>> testClasses = new ArrayList<>();
		try (final URLClassLoader classLoader = new URLClassLoader(classPathUrls);
		     final Stream<Path> stream = Files.walk(testClassesDir))
		{
			stream.filter(Tools::isClass).sorted().forEach(path -> {
				final String relativePath = testClassesDir.relativize(path).toString();
				final String className = relativePath
					.substring(0, relativePath.length() - ".class".length())
					.replace('/', '.')
					.replace('\\', '.');
				try
				{
					final Class<?> testClass = Class.forName(className, true, classLoader);
					testClasses.add(testClass);
				}
				catch (ClassNotFoundException e)
				{
					throw new AssertionError(className + " should exist", e);
				}
			});

			return new JUnitCore().run(testClasses.toArray(new Class[0]));
		}
		catch (IOException ex)
		{
			throw new RuntimeException("failed to walk " + testClassesDir.toString(), ex);
		}
	}

	public static int genCompileRun(//
		OutputStream out, OutputStream err,//
		Path srcDir, //
		Path modelSrcDir, Path testSrcDir,//
		Path modelClassesDir, Path testClassesDir,//
		String... scenariocArgs
	) throws Exception
	{
		final PrintStream printErr = new PrintStream(err, false, StandardCharsets.UTF_8);

		try
		{
			final int scenarioc = scenarioc(out, err, srcDir, modelSrcDir, testSrcDir, scenariocArgs);
			if (scenarioc != 0)
			{
				return scenarioc << 2;
			}

			String classPath = System.getProperty("java.class.path");

			try (final Stream<Path> stream = Files.walk(modelSrcDir))
			{
				if (stream.anyMatch(Tools::isJava))
				{
					// only compile model folder if there are any java files.
					final int modelJavac = javac(out, err, classPath, modelClassesDir, modelSrcDir);
					if (modelJavac != 0)
					{
						return modelJavac << 2 | 1;
					}
				}
			}

			final String testClassPath = modelClassesDir + File.pathSeparator + classPath;
			final int testJavac = javac(out, err, testClassPath, testClassesDir, testSrcDir);
			if (testJavac != 0)
			{
				return testJavac << 2 | 2;
			}

			// call all test methods
			final Result testResult = Tools.runTests(modelClassesDir, testClassesDir);

			for (final Failure failure : testResult.getFailures())
			{
				printErr.print(failure.getTestHeader());
				printErr.println("failed:");

				failure.getException().printStackTrace(printErr);
			}

			final int failureCount = testResult.getFailureCount();
			return failureCount == 0 ? 0 : failureCount << 2 | 3;
		}
		catch (Exception ex)
		{
			ex.printStackTrace(printErr);
			return -1;
		}
		finally
		{
			printErr.flush();
		}
	}
}
