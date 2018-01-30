---
path: "/docs/philosophy"
date: "2015-06-01T22:12:03.284Z"
title: "Philosophy"
description: "The philosophy, vision, and motivation behind Formik"
back: "/docs"
---

# Philosophy

## Overview

Let's face it, forms are really verbose in [React](https://github.com/facebook/react). To make matters worse, most form helpers do wayyyy too much magic and often have a significant performance cost associated with them. Formik is a small library that helps you with the 3 most annoying parts:

1. Getting values in and out of form state
2. Validation and error messages
3. Handling form submission

By colocating all of the above in one place, Formik will keep things organized--making testing, refactoring, and reasoning about your forms a breeze.

## Backstory

I wrote Formik while building a large internal administrative dashboard with [Ian White](https://github.com/eonwhite). With around ~30 unique forms, it quickly became obvious that we could benefit by standardizing not just our input components but also the way in which data flowed through our forms.

## Why not Redux Form?

By now, you might be thinking, "Why didn't you just use [Redux-Form](https://github.com/erikras/redux-form)?" Good question.

1. According to our prophet Dan Abramov, [**form state is inherently emphemeral and local**, so tracking it in Redux is unecessary](https://github.com/reactjs/redux/issues/1287#issuecomment-175351978)
2. Redux-Form calls your entire top-level reducer multiple times ON EVERY KEYSTROKE. This is fine for small apps, but as your Redux app grows, input latency will continue increase if you use Redux-Form
3. I no longer use [Redux](https://github.com/reactjs/redux) or [MobX](https://mobx.js.org/), just React's setState.
4. Redux-Form is 22.5 kB minified gzipped (Formik is 9.2 kB)

My goal with Formik was to create a scalable, performant, form helper with a minimal API that does the really really annoying stuff, and leaves the rest up to you.

## Influences

Formik started by expanding on [this little higher order component](https://github.com/jxnblk/rebass-recomposed/blob/master/src/withForm.js) by [Brent Jackson](https://github.com/jxnblk), some naming conventions from Redux-Form, and (most recently) the render props approach popularized by [React-Motion](https://github.com/chenglou/react-motion) and [React-Router 4](https://github.com/ReactTraining/react-router). Whether you have used any of the above or not, Formik only takes a few minutes to get started with.
