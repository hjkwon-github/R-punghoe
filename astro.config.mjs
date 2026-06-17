// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://r-punghoe.pages.dev',
	integrations: [
		starlight({
			title: 'R-punghoe',
			description: '알상무 공개 기록 아카이브 위키',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/hjkwon-github/R-punghoe' }],
			sidebar: [
				{
					label: '시작하기',
					items: [
						{ label: '소개', slug: 'about' },
						{ label: '기록 원칙', slug: 'principles' },
						{ label: '기여하기', slug: 'contributing' },
					],
				},
				{
					label: '기록실',
					items: [
						{ label: '연대기', slug: 'archive/timeline' },
						{ label: '용어사전', slug: 'archive/glossary' },
					],
				},
			],
		}),
	],
});
