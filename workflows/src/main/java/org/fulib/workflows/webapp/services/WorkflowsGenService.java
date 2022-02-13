package org.fulib.workflows.webapp.services;

import org.fulib.workflows.generators.BoardGenerator;
import org.fulib.workflows.webapp.model.GenerateResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
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
        final Path pagesDir = genDir.resolve("pages");

        try {
            // Generate everything
            GenerateResult generateResult = new GenerateResult();
            BoardGenerator boardGenerator = new BoardGenerator().setWebGeneration(webGeneration).setGenDir(genDir.toString());
            boardGenerator.generateBoardFromString(yamlData);
            
            String boardUrl = "/" + tempDir.relativize(genDir) + "/Board.html";
            generateResult.setBoard(boardUrl);

            generateResult.setPages(getUrls(tempDir, pagesDir, "_page.html"));
            if (generateResult.getPages() != null) {
                generateResult.setNumberOfPages(generateResult.getPages().size());
            }

            generateResult.setFxmls(getUrls(tempDir, fxmlsDir, "_fxml.fxml"));
            if (generateResult.getFxmls() != null) {
                generateResult.setNumberOfFxmls(generateResult.getFxmls().size());
            }

            generateResult.setDiagrams(getUrls(tempDir, diagramsDir, "_diagram.svg"));
            if (generateResult.getDiagrams() != null) {
                generateResult.setNumberOfDiagrams(generateResult.getDiagrams().size());
            }

            if (Files.exists(classDir)) {
                String classDiagramUrl = "/" + tempDir.relativize(genDir) + "/class/classDiagram.svg";
                generateResult.setClassDiagram(classDiagramUrl);
            }

            return generateResult;
        } finally {
            this.deleter.schedule(() -> WorkflowsGenService.deleteRecursively(genDir), 1, TimeUnit.HOURS);
        }
    }

    private Map<Integer, String> getUrls(Path tempDir, Path searchDir, String fileName) {
        if (Files.exists(searchDir)) {
            File[] allFiles = searchDir.toFile().listFiles();
            if (allFiles != null) {
                Map<Integer, String> result = new HashMap<>();

                for (int i = 0; i < allFiles.length; i++) {
                    String cmpFileName = i + fileName;
                    String fileUrl = "/" + tempDir.relativize(searchDir) + "/" + cmpFileName;
                    result.put(i, fileUrl);
                }
                return result;
            }
        }
        return null;
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
