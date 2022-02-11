package org.fulib.workflows.webapp.controller;

import org.fulib.workflows.webapp.model.GenerateResult;
import org.fulib.workflows.webapp.services.FulibWorkflowsService;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@CrossOrigin()
public class FulibWorkflowsController {
    FulibWorkflowsService fulibWorkflowsService = new FulibWorkflowsService();

    @PostMapping(path = "/generate", consumes = MediaType.ALL_VALUE)
    @ResponseBody
    public GenerateResult generate(@RequestBody String yamlData) throws Exception {
        return fulibWorkflowsService.generate(yamlData);
    }

    @PostMapping(path = "/download", consumes = MediaType.ALL_VALUE, produces = "application/zip")
    @ResponseBody
    public byte[] download(@RequestBody String yamlData, @RequestParam Map<String, String> queryParams) throws Exception {
        return fulibWorkflowsService.createZip(yamlData, queryParams);
    }
}
