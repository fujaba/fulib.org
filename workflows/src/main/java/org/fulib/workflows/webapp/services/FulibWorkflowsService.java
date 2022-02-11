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
    WorkflowsGenService workflowsGenService = new WorkflowsGenService();

    public GenerateResult generate(String yamlData) throws Exception {
        return workflowsGenService.run(yamlData, true);
    }


    public byte[] createZip(String yamlData, Map<String, String> queryParams) throws Exception {
        GenerateResult generateResult = workflowsGenService.run(yamlData, false);

        // TODO Get the file content from the links instead of getBoard()

        try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
             ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream)) {

            // Yaml file
            if (queryParams.get("yaml").equals("true")) {
                createZipEntry(zipOutputStream, "workflow.es.yaml", yamlData);
            }

            // Board file
            if (queryParams.get("board").equals("true") && generateResult.getBoard() != null) {
                createZipEntry(zipOutputStream, "board.html", generateResult.getBoard());
            }

            // Mockup Directory
            if (queryParams.get("pages").equals("true") && generateResult.getNumberOfPages() > 0) {
                zipOutputStream.putNextEntry(new ZipEntry("mockups/"));

                // Mockup files
                for (int i = 1; i <= generateResult.getNumberOfPages(); i++) {
                    String fileName = "mockups/" + i + "_mockup.html";
                    createZipEntry(zipOutputStream, fileName, generateResult.getPages().get(i));
                }
            }

            // Diagram Directory
            if (queryParams.get("objects").equals("true") && generateResult.getNumberOfDiagrams() > 0) {
                zipOutputStream.putNextEntry(new ZipEntry("diagrams/"));

                // Diagram files
                for (int i = 1; i <= generateResult.getNumberOfDiagrams(); i++) {
                    String fileName = "diagrams/" + i + "_diagram.svg";
                    createZipEntry(zipOutputStream, fileName, generateResult.getDiagrams().get(i));
                }
            }

            // Class Directory
            if (queryParams.get("class").equals("true") && generateResult.getClassDiagram() != null) {
                createZipEntry(zipOutputStream, "class/classdiagram.svg", generateResult.getClassDiagram());
            }

            // Fxml Directory
            if (queryParams.get("fxmls").equals("true") && generateResult.getNumberOfFxmls() > 0) {
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
}
