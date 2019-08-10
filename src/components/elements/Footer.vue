<template>
    <footer>
        <div class="container-fluid">
            <div class="row">
                <div class="col-sm-26 footer-quote-parent">
                    <h3 class="footer-quote">{{ quote }}</h3>
                </div>

                <div class="col-sm-17 footer-text-parent">
                    <h2>{{ about.title }}</h2>

                    <div v-html="about.text"></div>

                    <p>
                        <a :href="about.link.url">
                            <span class="icon icon-link"></span>
                            {{ about.link.text }}
                        </a>
                    </p>
                </div>

                <div class="col-sm-17 footer-text-parent">
                    <h2>{{ links.title }}</h2>

                    <div v-for="link in links.links">
                        <a :href="link.url">
                            <span class="icon icon-link"></span>
                            {{ link.text }}
                        </a>
                    </div>
                </div>
            </div>
            </div>
    </footer>
</template>

<script>
    export default {
        data() {
            return {
                quote: 'The best collaborations create something bigger than the sum of what each person can create on their own.',
                about: {
                    title: 'Over SURF',
                    text: '<p>SURF is de ICT-samenwerkingsorganisatie van het onderwijs en onderzoek in Nederland. Dankzij SURF beschikken studenten, docenten en onderzoekers in Nederland over de best mogelijke ICT-voorzieningen voor toponderzoek en talentontwikkeling.</p>',
                    link: {
                        url: 'http://surf.nl',
                        text: 'Visit SURF.nl'
                    }
                },
                links: {
                    title: 'Links',
                    links: [
                        {
                            url: 'https://creativecommons.nl/uitleg/',
                            text: 'Creative Commons licenties'
                        },
                        {
                            url: 'https://www.surf.nl/themas/onderwijsinnovatie-met-ict/open-leermaterialen/index.html',
                            text: 'SURF kennisdossier Open Leermaterialen'
                        }
                    ]
                }
            }
        }
    };
</script>
