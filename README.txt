Authors: Cathrine Underbjerg Hansen, Marc Bohner

The project shows a 3D scene with a chair, a table and a chess board on the table.
By using the clipX variable which is used in the position of the chair, the chair can be moved.
When the chair is at the table, it won't move further.

All the objects are made with cuboids as polyhedra.
The chess board is one cuboid, the table has a top cuboid and one as a leg.
The chair has a seat, a back and four legs.

To interact with the chair we implemented 2 buttons which move the chair to and from the table.

All the objects have their own textures.
The textures are loaded in the HTML file and then used in the JavaScript file by using the document.getElementById() function.
Every object has it's own function which creates the object (or calls functions to create parts of the object).
In those function the texture were applied to the objects using the gl.createTexture() and gl.bindTexture() functions.

For lighting the scene we used the ambient light and point light with specular reflection from lab 4.
Somehow the lights didn't work on a Windows computer, but they did work on a Mac.
In case it doesn't work, there is a screenshot of the scene with and without lighting in the folder.
Those 2 screenshots are called "with_lighting.png" and "without_lighting.png".

For the perspective projection we used the perspective projection matrix from the lecture slides.

