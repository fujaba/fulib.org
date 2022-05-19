package org.fulib.workflows.webapp.services;

import org.apache.tomcat.util.http.fileupload.ByteArrayOutputStream;
import org.fulib.workflows.webapp.model.GenerateResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class FulibWorkflowsService {
    private static final Logger LOGGER = LoggerFactory.getLogger(FulibWorkflowsService.class);

    WorkflowsGenService workflowsGenService = new WorkflowsGenService();

    public GenerateResult generate(String yamlData) throws Exception {
        return workflowsGenService.run(yamlData, true);
    }


    public byte[] createZip(String yamlData, Map<String, String> queryParams) throws Exception {
        GenerateResult generateResult = workflowsGenService.run(yamlData, false);

        try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
             ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream)) {

            // Yaml file
            if (queryParams.get("yaml").equals("true")) {
                createZipEntry(zipOutputStream, "workflow.es.yaml", yamlData);
            }

            // Board file
            if (queryParams.get("board").equals("true") && generateResult.getBoard() != null) {
                String board = Files.readString(Path.of(workflowsGenService.getTempDir() + generateResult.getBoard()));
                createZipEntry(zipOutputStream, "Board.html", board);
            }

            // Page Directory
            if (queryParams.get("pages").equals("true") && generateResult.getPages() != null
                    && generateResult.getPages().size() > 0) {
                zipOutputStream.putNextEntry(new ZipEntry("pages/"));

                // Page files
                for (int i = 0; i < generateResult.getPages().size(); i++) {
                    String fileName = "pages/" + i + "_page.html";
                    String page = Files.readString(Path.of(workflowsGenService.getTempDir() + generateResult.getPages().get(i)));
                    createZipEntry(zipOutputStream, fileName, page);
                }
            }

            // Diagram Directory
            if (queryParams.get("objects").equals("true") && generateResult.getDiagrams() != null
                    && generateResult.getDiagrams().size() > 0) {
                zipOutputStream.putNextEntry(new ZipEntry("diagrams/"));

                // Diagram files
                for (int i = 0; i < generateResult.getDiagrams().size(); i++) {
                    String fileName = "diagrams/" + i + "_diagram.svg";
                    String diagram = Files.readString(Path.of(workflowsGenService.getTempDir() + generateResult.getDiagrams().get(i)));
                    createZipEntry(zipOutputStream, fileName, diagram);
                }
            }

            // Class Directory
            if (queryParams.get("class").equals("true") && generateResult.getClassDiagram() != null) {
                zipOutputStream.putNextEntry(new ZipEntry("class/"));
                String classDiagram = Files.readString(Path.of(workflowsGenService.getTempDir() + generateResult.getClassDiagram()));
                createZipEntry(zipOutputStream, "class/classDiagram.svg", classDiagram);
            }

            // Fxml Directory
            if (queryParams.get("fxmls").equals("true") && generateResult.getFxmls() != null && generateResult.getFxmls().size() > 0) {
                zipOutputStream.putNextEntry(new ZipEntry("fxmls/"));

                // Diagram files
                for (int i = 0; i < generateResult.getFxmls().size(); i++) {
                    String fileName = "fxmls/" + i + "_fxml.fxml";
                    String fxml = Files.readString(Path.of(workflowsGenService.getTempDir() + generateResult.getFxmls().get(i)));
                    createZipEntry(zipOutputStream, fileName, fxml);
                }
            }

            zipOutputStream.finish();
            zipOutputStream.flush();
            zipOutputStream.close();

            return byteArrayOutputStream.toByteArray();
        } catch (
                IOException ioe) {
            ioe.printStackTrace();
            LOGGER.error(ioe.getMessage());
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
