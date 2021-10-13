package org.fulib.webapp.markdown;

import spark.Request;
import spark.Response;

import javax.inject.Inject;

public class MarkdownController
{
	@Inject
	public MarkdownController()
	{
	}

	public String render(Request request, Response response)
	{
		final String imageBaseUrl = request.queryParams("image_base_url");
		final String linkBaseUrl = request.queryParams("link_base_url");
		final MarkdownRenderer util = new MarkdownRenderer();
		if (imageBaseUrl != null)
		{
			util.setImageBaseUrl(imageBaseUrl);
		}
		if (linkBaseUrl != null)
		{
			util.setLinkBaseUrl(linkBaseUrl);
		}
		response.type("text/html");
		return util.renderHtml(request.body());
	}
}
