package org.fulib.webapp.tool;

import org.commonmark.Extension;
import org.commonmark.ext.autolink.AutolinkExtension;
import org.commonmark.ext.gfm.strikethrough.StrikethroughExtension;
import org.commonmark.ext.gfm.tables.TablesExtension;
import org.commonmark.ext.task.list.items.TaskListItemsExtension;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.AttributeProvider;
import org.commonmark.renderer.html.HtmlRenderer;

import java.util.Arrays;
import java.util.List;

public class MarkdownUtil
{
	private static final Extension[] _EXTENSIONS = {
		TablesExtension.create(),
		AutolinkExtension.create(),
		StrikethroughExtension.create(),
		TaskListItemsExtension.create(),
	};
	private static final List<Extension> EXTENSIONS = Arrays.asList(_EXTENSIONS);

	private static final Parser PARSER = Parser.builder().extensions(EXTENSIONS).build();

	private static final AttributeProvider ATTRIBUTE_PROVIDER = (node, tagName, attributes) -> {
		switch (tagName)
		{
		case "table":
			attributes.put("class", "table table-bordered");
			return;
		}
	};
	private static final HtmlRenderer RENDERER = HtmlRenderer.builder().extensions(EXTENSIONS).escapeHtml(true).attributeProviderFactory(context -> ATTRIBUTE_PROVIDER).build();

	public static String renderHtml(String markdown)
	{
		final Node document = PARSER.parse(markdown);
		return RENDERER.render(document);
	}
}
