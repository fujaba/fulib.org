package org.fulib.workflows.webapp.services;

import org.fulib.workflows.generators.BoardGenerator;
import org.fulib.workflows.webapp.model.GenerateResult;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class WorkflowsGenService {
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
            generateResult.setPages(getUrls(tempDir, pagesDir));
            generateResult.setFxmls(getUrls(tempDir, fxmlsDir));
            generateResult.setDiagrams(getUrls(tempDir, diagramsDir));

            if (Files.exists(classDir)) {
                String classDiagramUrl = "/" + tempDir.relativize(genDir) + "/class/classDiagram.svg";
                generateResult.setClassDiagram(classDiagramUrl);
            }

            return generateResult;
        } finally {
            this.deleter.schedule(() -> WorkflowsGenService.deleteRecursively(genDir), 1, TimeUnit.HOURS);
        }
    }

    private List<String> getUrls(Path tempDir, Path searchDir) {
        if (Files.exists(searchDir)) {
            File[] fileArray = searchDir.toFile().listFiles();
            List<File> allFiles = new ArrayList<>();
            if (fileArray != null) {
                allFiles = Arrays.asList(fileArray);
            }
            List<String> result = new ArrayList<>();

            // Sort allFiles
            allFiles.sort((o1, o2) -> {
                int o1Number = evalFileNumber(o1.getName());
                int o2Number = evalFileNumber(o2.getName());
                return Integer.compare(o1Number, o2Number);
            });

            for (File allFile : allFiles) {
                String cmpFileName = allFile.getName();
                String fileUrl = "/" + tempDir.relativize(searchDir) + "/" + cmpFileName;
                result.add(fileUrl);
            }
            return result;
        }
        return null;
    }

    private int evalFileNumber(String name) {
        int lowIndex = name.indexOf("_");
        String numberAsString = name.substring(0, lowIndex);
        return Integer.parseInt(numberAsString);
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
