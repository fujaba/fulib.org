package org.fulib.workflows.webapp.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class CustomErrorController implements ErrorController {
    @RequestMapping("/error")
    public String handleError() {
        return "error";
    }

    @RequestMapping("/notYetGenerated")
    public String handleNotYetGenerated() {
        return "notYetGenerated";
    }

    @RequestMapping("/pagesFallback")
    public String handlePageFallback() {
        return "pages";
    }

    @RequestMapping("/objectsFallback")
    public String handleObject() {
        return "objects";
    }

    @RequestMapping("/classFallback")
    public String handleClassFallback() {
        return "class";
    }
}
