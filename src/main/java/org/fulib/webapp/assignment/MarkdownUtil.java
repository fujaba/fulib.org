package org.fulib.webapp.assignment;

import org.commonmark.Extension;
import org.commonmark.ext.autolink.AutolinkExtension;
import org.commonmark.ext.gfm.strikethrough.StrikethroughExtension;
import org.commonmark.ext.gfm.tables.TablesExtension;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;

import java.util.Arrays;
import java.util.List;

public class MarkdownUtil
{
	private static final List<Extension> EXTENSIONS = Arrays.asList(TablesExtension.create(),
	                                                                AutolinkExtension.create(),
	                                                                StrikethroughExtension.create());

	private static final Parser PARSER = Parser.builder().extensions(EXTENSIONS).build();

	private static final HtmlRenderer RENDERER = HtmlRenderer.builder().escapeHtml(true).build();

	public static String renderHtml(String markdown)
	{
		final Node document = PARSER.parse(markdown);
		return RENDERER.render(document);
	}
}
