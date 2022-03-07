package org.fulib.workflows.webapp;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String osName = System.getProperty("os.name");
        if (osName.contains("Windows") || osName.contains("windows")) {
            registry.addResourceHandler("/workflows/**")
                    .addResourceLocations("file:/" + System.getProperty("java.io.tmpdir") + "/fulib.org/workflows/")
                    .setCachePeriod(60 * 60);
        } else {
            registry.addResourceHandler("/workflows/**")
                    .addResourceLocations("file://" + System.getProperty("java.io.tmpdir") + "/fulib.org/workflows/")
                    .setCachePeriod(60 * 60);
        }
    }
}
