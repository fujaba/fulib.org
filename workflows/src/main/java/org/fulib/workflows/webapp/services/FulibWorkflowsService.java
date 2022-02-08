package org.fulib.workflows.webapp.services;

import org.apache.tomcat.util.http.fileupload.ByteArrayOutputStream;
import org.fulib.workflows.generators.BoardGenerator;
import org.fulib.workflows.webapp.model.GenerateResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class FulibWorkflowsService {
    Logger logger = LoggerFactory.getLogger(FulibWorkflowsService.class);

    public GenerateResult generate(String yamlData) {
        return generateFromYaml(yamlData, true);
    }


    public byte[] createZip(String yamlData, Map<String, String> queryParams) {
        GenerateResult generateResult = generateFromYaml(yamlData, false);


        try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
             ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream)) {

            // Yaml file
            if (queryParams.get("exportYaml").equals("true")) {
                createZipEntry(zipOutputStream, "workflow.es.yaml", yamlData);
            }

            // Board file
            if (queryParams.get("exportBoard").equals("true")) {
                createZipEntry(zipOutputStream, "board.html", generateResult.getBoard());
            }

            // Mockup Directory
            if (queryParams.get("exportPages").equals("true") && generateResult.getNumberOfPages() > 0) {
                zipOutputStream.putNextEntry(new ZipEntry("mockups/"));

                // Mockup files
                for (int i = 1; i <= generateResult.getNumberOfPages(); i++) {
                    String fileName = "mockups/" + i + "_mockup.html";
                    createZipEntry(zipOutputStream, fileName, generateResult.getPages().get(i));
                }
            }

            // Diagram Directory
            if (queryParams.get("exportObjects").equals("true") && generateResult.getNumberOfDiagrams() > 0) {
                zipOutputStream.putNextEntry(new ZipEntry("diagrams/"));

                // Diagram files
                for (int i = 1; i <= generateResult.getNumberOfDiagrams(); i++) {
                    String fileName = "diagrams/" + i + "_diagram.svg";
                    createZipEntry(zipOutputStream, fileName, generateResult.getDiagrams().get(i));
                }
            }

            // Class Directory
            if (queryParams.get("exportClass").equals("true") && generateResult.getClassDiagram() != null) {
                createZipEntry(zipOutputStream, "class/classdiagram.svg", generateResult.getClassDiagram());
            }

            // Fxml Directory
            if (queryParams.get("exportFxmls").equals("true") && generateResult.getNumberOfFxmls() > 0) {
                zipOutputStream.putNextEntry(new ZipEntry("fxmls/"));

                // Diagram files
                for (int i = 1; i <= generateResult.getNumberOfFxmls(); i++) {
                    String fileName = "fxmls/" + i + "_fxml.fxml";
                    createZipEntry(zipOutputStream, fileName, generateResult.getFxmls().get(i));
                }
            }

            zipOutputStream.finish();
            zipOutputStream.flush();
            zipOutputStream.close();

            return byteArrayOutputStream.toByteArray();
        } catch (
                IOException ioe) {
            ioe.printStackTrace();
            logger.error(ioe.getMessage());
        }

        return null;
    }

    private void createZipEntry(ZipOutputStream zipOutputStream, String fileName, String data) throws IOException {
        ZipEntry zipEntry = new ZipEntry(fileName);
        zipOutputStream.putNextEntry(zipEntry);
        zipOutputStream.write(data.getBytes(StandardCharsets.UTF_8));
        zipOutputStream.closeEntry();
    }


    private GenerateResult generateFromYaml(String yamlData, boolean webGeneration) {
        GenerateResult generateResult = new GenerateResult();
        BoardGenerator boardGenerator = new BoardGenerator();
        boardGenerator.setWebGeneration(webGeneration);

        Map<String, String> htmls = boardGenerator.generateAndReturnHTMLsFromString(yamlData);

        // Add Board
        generateResult.setBoard(getSingleView(htmls, "Board"));

        // Add Pages
        generateResult.setPages(getMultipleViews(htmls, "page"));

        generateResult.setNumberOfPages(generateResult.getPages().size());

        // Add Objects
        generateResult.setDiagrams(getMultipleViews(htmls, "diagram"));

        generateResult.setNumberOfDiagrams(generateResult.getDiagrams().size());

        // Add Class
        generateResult.setClassDiagram(getSingleView(htmls, "class"));

        // Add fxmls
        generateResult.setFxmls(getMultipleViews(htmls, "fxml"));

        generateResult.setNumberOfFxmls(generateResult.getFxmls().size());

        return generateResult;
    }

    private String getSingleView(Map<String, String> htmls, String type) {
        for (String key : htmls.keySet()) {
            if (key.contains(type)) {
                return htmls.get(key);
            }
        }
        return "Nothing found";
    }

    private Map<Integer, String> getMultipleViews(Map<String, String> views, String type) {
        Map<Integer, String> result = new HashMap<>();

        for (String key : views.keySet()) {
            if (key.contains(type)) {
                int index = Integer.parseInt(key.substring(0, key.indexOf("_")));
                result.put(index + 1, views.get(key));
            }
        }

        return result;
    }
}
