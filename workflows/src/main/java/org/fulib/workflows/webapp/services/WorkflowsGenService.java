package org.fulib.workflows.webapp.services;

import org.fulib.workflows.generators.BoardGenerator;
import org.fulib.workflows.webapp.model.GenerateResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class WorkflowsGenService {
    // =============== Constants ===============

    private static final Logger LOGGER = LoggerFactory.getLogger(WorkflowsGenService.class);

    // =============== Fields ===============
    private final String tempDir = System.getProperty("java.io.tmpdir") + "/fulib.org/workflows/";
    private final ScheduledExecutorService deleter = Executors.newScheduledThreadPool(1);

    // =============== Methods ===============

    public String getTempDir() {
        return this.tempDir;
    }

    public GenerateResult run(String yamlData, boolean webGeneration) throws Exception {
        final String id = UUID.randomUUID().toString();
        final Path tempDir = Paths.get(this.getTempDir());
        final Path genDir = tempDir.resolve(id).resolve("tmp");
        final Path classDir = genDir.resolve("class");
        final Path diagramsDir = genDir.resolve("diagrams");
        final Path fxmlsDir = genDir.resolve("fxmls");
        final Path mockupsDir = genDir.resolve("mockups");

        try {
            // Generate everything
            GenerateResult generateResult = new GenerateResult();
            BoardGenerator boardGenerator = new BoardGenerator();
            boardGenerator.setWebGeneration(webGeneration);
            boardGenerator.generateBoardFromString(yamlData);

            // TODO Build proper generate Result
            // create gen directories
            Files.createDirectories(genDir);

            // create classDir and files
            Files.createDirectories(classDir);

            // create diagramsDir and files
            Files.createDirectories(diagramsDir);

            // create fxmlsDir and files
            Files.createDirectories(fxmlsDir);

            // create mockupsDir and files
            Files.createDirectories(mockupsDir);

            return generateResult;
        } finally {
            this.deleter.schedule(() -> WorkflowsGenService.deleteRecursively(genDir), 1, TimeUnit.HOURS);
        }
    }

    public static void deleteRecursively(Path dir) {
        try {
            Files.walk(dir).sorted(Comparator.reverseOrder()).forEach(file -> {
                try {
                    Files.deleteIfExists(file);
                } catch (IOException ignored) {
                }
            });
        } catch (IOException ignored) {
        }
    }
}
