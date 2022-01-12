import { writable } from "svelte/store";

export const error = writable("");
export const requestCounter = writable(0);
