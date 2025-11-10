/**
 * React 19 Compatibility Layer
 * 
 * This file provides type-safe wrappers for Next.js components that have
 * compatibility issues with React 19's stricter JSX types.
 * 
 * This is a temporary workaround until Next.js fully supports React 19.
 */

import NativeHead from 'next/head';
import NativeLink from 'next/link';
import type { ComponentType } from 'react';

// Type assertions to work around React 19 JSX compatibility issues
export const Head = NativeHead as ComponentType<any>;
export const Link = NativeLink as ComponentType<any>;
