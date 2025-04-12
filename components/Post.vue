<template>
    <article class="post">
        <div class="two-column-grid">
            <div class="grid-sidebar">
                <span class="post-date">{{ formattedDate }}</span>
            </div>
            <div class="grid-main">
                <NuxtLink :to="`/posts/${post.slug}`" class="post-link">
                    <h2 class="post-title">{{ post.title }}</h2>
                    <p class="post-description">{{ post.description }}</p>
                </NuxtLink>
            </div>
        </div>
    </article>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    post: {
        type: Object,
        required: true,
    },
});

// Format date as "Month YYYY"
const formattedDate = computed(() => {
    if (!props.post.publishDate) return "";

    const date = new Date(props.post.publishDate);
    return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
});
</script>

<style scoped>
.post {
    margin-bottom: var(--spacing-3xl);
}

.post-link {
    display: block;
    color: inherit;
    text-decoration: none;
    transition: transform 0.3s ease;
    padding-left: 0;
}

.post-link:hover {
    transform: translateX(10px);
}

.post-link:hover .post-title {
    color: var(--color-primary);
}

.post-date {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
}

.post-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--spacing-xs);
}

.post-description {
    font-size: var(--font-size-base);
    line-height: 1.6;
    color: var(--color-text-secondary);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .post-date {
        margin-bottom: var(--spacing-xs);
    }
}
</style>
