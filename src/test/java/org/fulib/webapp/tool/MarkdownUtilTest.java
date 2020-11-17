package org.fulib.webapp.tool;

import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;

public class MarkdownUtilTest
{
	@Test
	public void renderHtml()
	{
		final MarkdownUtil md = new MarkdownUtil();

		// plain markdown
		assertThat(md.renderHtml("# Hello World\n\nsome **bold** and _italic_ text"),
		           equalTo("<h1>Hello World</h1>\n" + "<p>some <strong>bold</strong> and <em>italic</em> text</p>\n"));
		// tables
		assertThat(md.renderHtml("| col1 | col2 |\n|-----|-----|\n|  v1  |  v2  |"), equalTo(
			"<table class=\"table table-bordered\">\n" + "<thead>\n" + "<tr>\n" + "<th>col1</th>\n" + "<th>col2</th>\n"
			+ "</tr>\n" + "</thead>\n" + "<tbody>\n" + "<tr>\n" + "<td>v1</td>\n" + "<td>v2</td>\n" + "</tr>\n"
			+ "</tbody>\n" + "</table>\n"));
		// strikethrough
		assertThat(md.renderHtml("~~strikethrough~~"), equalTo("<p><del>strikethrough</del></p>\n"));
		// autolink
		assertThat(md.renderHtml("www.fulib.org\n\nhttp://www.fulib.org"),
		           equalTo("<p>www.fulib.org</p>\n<p><a href=\"http://www.fulib.org\">http://www.fulib.org</a></p>\n"));
		// task lists
		assertThat(md.renderHtml("- [ ] first\n- [x] second"), equalTo(
			"<ul>\n" + "<li><input type=\"checkbox\" disabled=\"\"> first</li>\n"
			+ "<li><input type=\"checkbox\" disabled=\"\" checked=\"\"> second</li>\n" + "</ul>\n"));
		// html escaping
		assertThat(md.renderHtml("<script>alert('XSS')</script>"),
		           equalTo("<p>&lt;script&gt;alert('XSS')&lt;/script&gt;</p>\n"));
		// fenced code blocks with language
		assertThat(md.renderHtml("```java\nSystem.out.println();\n```"), equalTo(
			"<pre><code class=\"language-java\" data-language=\"java\">System.out.println();\n" + "</code></pre>\n"));
	}
}
