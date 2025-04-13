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
    font-weight: normal; /* Override the global bold style */
    transition: transform 0.3s ease;
    padding-left: 0;
}

.post-link:hover {
    transform: translateX(10px);
}

.post-link:hover .post-title {
    color: var(--color-primary);
}

.post .grid-sidebar {
    display: flex;
    align-items: flex-start;
    padding-top: 0.2em; /* Fine-tuned alignment with the title */
}

.post-date {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
}

.post-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    margin-top: 0; /* Reset the top margin from global styles */
    margin-bottom: var(--spacing-xs);
}

.post-description {
    font-size: var(--font-size-base);
    line-height: 1.6;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-normal); /* Ensure normal weight */
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .post-date {
        margin-bottom: var(--spacing-xs);
    }
    
    /* Disable hover effects on mobile */
    .post-link:hover {
        transform: none; /* Remove the x-movement effect */
    }
}
</style>
