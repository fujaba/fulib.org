package org.fulib.webapp.markdown;

import org.commonmark.Extension;
import org.commonmark.ext.autolink.AutolinkExtension;
import org.commonmark.ext.gfm.strikethrough.StrikethroughExtension;
import org.commonmark.ext.gfm.tables.TablesExtension;
import org.commonmark.ext.task.list.items.TaskListItemsExtension;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.AttributeProvider;
import org.commonmark.renderer.html.HtmlRenderer;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.List;

public class MarkdownRenderer
{
	// =============== Fields ===============

	private static final Extension[] _EXTENSIONS = {
		TablesExtension.create(),
		AutolinkExtension.create(),
		StrikethroughExtension.create(),
		TaskListItemsExtension.create(),
	};
	private static final List<Extension> EXTENSIONS = Arrays.asList(_EXTENSIONS);

	private static final Parser PARSER = Parser.builder().extensions(EXTENSIONS).build();

	private final AttributeProvider attributeProvider = (node, tagName, attributes) -> {
		switch (tagName)
		{
		case "table":
			attributes.put("class", "table table-bordered");
			return;
		case "code":
			final String className = attributes.get("class");
			if (className != null && className.startsWith("language-"))
			{
				attributes.put("lang", className.substring("language-".length()));
			}
			return;
		case "img":
			final String src;
			if (this.imageBaseUrl != null && (src = attributes.get("src")) != null && isRelative(src))
			{
				attributes.put("src", this.imageBaseUrl + src);
			}
			return;
		case "a":
			final String href;
			if (this.linkBaseUrl != null && (href = attributes.get("href")) != null && isRelative(href))
			{
				attributes.put("href", this.linkBaseUrl + href);
			}
			return;
		}
	};
	private final HtmlRenderer renderer = HtmlRenderer
		.builder()
		.extensions(EXTENSIONS)
		.attributeProviderFactory(context -> attributeProvider)
		.build();

	private String imageBaseUrl;
	private String linkBaseUrl;

	// =============== Properties ===============

	public String getImageBaseUrl()
	{
		return this.imageBaseUrl;
	}

	public void setImageBaseUrl(String imageBaseUrl)
	{
		this.imageBaseUrl = imageBaseUrl;
	}

	public String getLinkBaseUrl()
	{
		return linkBaseUrl;
	}

	public void setLinkBaseUrl(String linkBaseUrl)
	{
		this.linkBaseUrl = linkBaseUrl;
	}

	// =============== Methods ===============

	public String renderHtml(String markdown)
	{
		final Node document = PARSER.parse(markdown);
		return this.renderer.render(document);
	}

	private static boolean isRelative(String url)
	{
		try
		{
			return !new URI(url).isAbsolute();
		}
		catch (URISyntaxException e)
		{
			return false;
		}
	}
}
