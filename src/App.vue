<template>
    <div class="app_container">
        <NavBar class="z-[999]" />
        <div
            class="app_container_inner z-[888]"
        >
            <div>
                <router-view />
            </div>
            <Toasts />
        </div>
    </div>
</template>

<style scoped></style>
