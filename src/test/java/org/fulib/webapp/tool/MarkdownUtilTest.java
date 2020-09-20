package org.fulib.webapp.tool;

import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;

public class MarkdownUtilTest
{
	@Test
	public void renderHtml()
	{
		// plain markdown
		assertThat(MarkdownUtil.renderHtml("# Hello World\n\nsome **bold** and _italic_ text"),
		           equalTo("<h1>Hello World</h1>\n" + "<p>some <strong>bold</strong> and <em>italic</em> text</p>\n"));
		// tables
		assertThat(MarkdownUtil.renderHtml("| col1 | col2 |\n|-----|-----|\n|  v1  |  v2  |"), equalTo(
			"<table>\n" + "<thead>\n" + "<tr>\n" + "<th>col1</th>\n" + "<th>col2</th>\n" + "</tr>\n" + "</thead>\n"
			+ "<tbody>\n" + "<tr>\n" + "<td>v1</td>\n" + "<td>v2</td>\n" + "</tr>\n" + "</tbody>\n" + "</table>\n"));
		// strikethrough
		assertThat(MarkdownUtil.renderHtml("~~strikethrough~~"), equalTo("<p><del>strikethrough</del></p>\n"));
		// autolink
		assertThat(MarkdownUtil.renderHtml("www.fulib.org\n\nhttp://www.fulib.org"),
		           equalTo("<p>www.fulib.org</p>\n<p><a href=\"http://www.fulib.org\">http://www.fulib.org</a></p>\n"));
		// html escaping
		assertThat(MarkdownUtil.renderHtml("<script>alert('XSS')</script>"),
		           equalTo("<p>&lt;script&gt;alert('XSS')&lt;/script&gt;</p>\n"));
	}
}
