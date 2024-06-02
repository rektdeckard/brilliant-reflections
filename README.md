# 2024 CT Take-Home

## Resources

- [Assignment](https://brilliantorg.notion.site/2024-CT-Take-Home-8d7ecb8ff80e43cba3b522705aa73e88#aaf2bbb54a454f04a480dfeadfe7da6f)
- [tldraw whiteboard](https://www.tldraw.com/ro/pUr01FRTNQ0JiagExSw57?v=-522,-1016,3467,3135&p=hO2812LSqTXYPThaVkX3G)


## Postmortem

**Now that you've had a chance to implement it, are there different features you would have prioritized, knowing what you know now?**

Given my somewhat limited experience with `p5`, if I had the chance to reimplement this interactive, I would begin with the decision to write it in pure JavaScript, and tools and techniques a little more familiar to me. Though `p5` has some powerful features, and is probably a more useful library for building at scale, I would simply have had more time to focus on solving the problem than exploring the library.

That fact aside, there are two major changes I would make to this insteractive. First, I would rethink the drag-and-drop mode of interaction to make the problem a little more challenging to solve. As it is, the user can freely position the object within the room until the success criteria are met (the object is in the correct position to produce the given virtual images). By adding an element of risk, possibly by hiding the virtual image projections and asking the student to submit their response, we might might the lesson more instructive, and cause the student to pause and think, rather than to trial-and-error their way to an answer.

Second, I would have been more methodical with my approach to code cleanliness. There are quite a few hard-coded procedures that rely on prior knowledge of the scene geometry, rather than being implemented as a physics simulation. This makes the code written here a lot less reusable, and more difficult to modify in case of design changes.

---

**How could your interactive be extended to cover more concepts in optics?**

The simulation of light rays could be adapted to model curved mirrors, lenses, and refraction using the same visual language and principles. Though there are some reusability issues mentioned above, a more complete simulation could easily form a sandbox within which complex room geometries (such as the kaleidoscope example) or  could be quickly built.

---

**What parts of your interactive could be useful in other areas of STEM? Give a few examples.**

Some of the geometry utilities could be repurposed for other physics-based simulations for mechanics, acoustics, particle physics, etc. A frictionless elastic collision is a frictionless elastic coollision!

Others, like the drag-and-drop mode of interaction, could be a useful alternative to multiple-choice response in virtually any course subject.
