package org.fulib.workflows.webapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@SpringBootApplication
@EnableWebMvc
public class WorkflowsBackend {

    public static void main(String[] args) {
        SpringApplication.run(WorkflowsBackend.class, args);
    }
}
