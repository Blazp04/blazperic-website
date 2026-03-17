import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";
import { BLOG_POSTS } from "../data/blogPosts";

export async function GET(context) {
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: BLOG_POSTS.map((post) => ({
			title: post.title,
			description: post.description,
			pubDate: new Date(post.date),
			link: `/blog/${post.slug}/`,
		})),
	});
}
