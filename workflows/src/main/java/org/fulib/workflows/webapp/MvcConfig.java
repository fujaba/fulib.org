package org.fulib.workflows.webapp;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String osName = System.getProperty("os.name");
        String prefix = osName.contains("Windows") || osName.contains("windows") ? "file:/" : "file://"; // important
        registry.addResourceHandler("/api/v1/workflows/**")
            .addResourceLocations(prefix + System.getProperty("java.io.tmpdir") + "/fulib.org/workflows/")
            .setCachePeriod(60 * 60);
    }
}
