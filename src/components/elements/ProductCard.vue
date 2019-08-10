<template>
    <div class="product-card-parent">
        <router-link class="clearfix product-card" :class="type" :to="{ name: 'product', params: { id: encodeURIComponent(product.id) } }">
            <div class="product-card-type" :class="{ 'dashed-bottom': (type == 'list') }">
                <img class="product-card-icon" :src="product.icon">
                <strong>{{ product.type.human }}</strong>
                {{ product.type.format }}
            </div>

            <div class="clear"></div>

            <div class="product-card-left">
                <h4>
                    {{ product.title }}
                </h4>

                <div class="product-card-date">{{ product.date }}</div>

                <div class="product-card-description">
                    {{ product.description }}
                </div>
            </div>

            <div class="product-card-right">
                <div class="product-card-author-levels" :class="{ 'dashed-bottom': (type == 'list') }">
                    <span v-if="product.author.name">
                        <strong>{{ product.author.name }}</strong><br>
                    </span>
                    <span>{{ product.author.institutes.join(', ') }}</span><br>
                    <span>{{ product.levels.join(', ') }}</span>
                </div>

                <div class="clearfix product-card-footer">
                    <span v-for="license in product.licenses" class="license-icon" :class="'icon icon-cc-' + license.value"></span>
                </div>
            </div>
        </router-link>

        <a class="button image size-small product-card-download" :href="product.downloadLink" target="_blank">
            <span class="icon icon-download"></span>
        </a>
    </div>
</template>

<script>
    export default {
        props: {
            product: null,
            type: {
                default: 'card'
            }
        }
    };
</script>
