Authors: Cathrine Underbjerg Hansen, Marc Bohner

How we implemented the game:
At first we created an rectangle for the player in the setupPlayerPile() function and set it's color to black in the render() function.
Then we created the ball in the setupBall() function using the parametric equation and set it's color to purple.

To move the player we used the onmousemove html function which calls movePlayerPile() to get the coordinates of the mouse.
Because we only want to move the player on the x-axis, we're just changing the x-coordinates of the player object when moving the mouse.

To move the ball we set the speed to 0.01 and animated it using the render() function.
Then we implemented a variable called gameStarted which will be triggered by a click on the button "Start Game" or by pressing the spacebar.
The ball will move upwards when the game is started.

In the setupGoalObject() function we initialized our goal object.
We set the color of the goal object to gold in the render() function.

After that we started to create all the objects around the goal object using the setupObjects() function which creates 3 columns of objects.
The first and last column contain 7 objects and the middle column contains 2 objects.
To simplify the code we created a setupObject() function which takes 4 points as parameters and creates an object with these points.
The setupObjects() function calls the setupObject() function for each object.
For the colors of the different objects we use a setColor() function which assigns a color (red, blue or green) to an object using a global objectColors array.
In the render() function we just use this array to set the color to each object.

In order to check if the ball hits an object or a wall we created a ballCollision() function.
In this function we first added a check if the ball hits the player object.
When the ball hits the player object we use a function called moveBallUpInAngle() which calculates an angle in which the ball will move upwards.
The angle is calculated by the distance between the ball and the mid point of the player object.
After that, we implemented checks if the ball hits one of the walls and change the balls direction depending which wall is hit.
Then we implemented a check if the ball hits the goal object in a gameWon() function which also sets the gameStarted variable to 0 to stop the game.
If the ball hits the bottom wall we call a gameOver() function to stop the game aswell.
In the gameOver() function we print "You lost" below the canvas.
In the gameWon() function we print "You won" below the canvas.

The ballCollision() function also checks if the ball hits one of the objects.
Depending on the side on which the ball hits and object we invert the moveUp or moveRight variable to change the direction of the ball.
After that we call the removeObject() function which removes the object from the canvas.

For the scoring system we use the values for the colors saved in the objectColors array.
Green is 3 points, blue is 2 points and red is 1 point.
We implemented a score variable which is increased by the value of the color when the ball hits an object.
To show the score we implemented a text below the canvas which shows the current score.
When the game is lost the score will be reset to 0.

We also implemented a "Reset Game" button which resets the game to it's initial state when clicked.
You can also use the "R" key to reset the game.



Controls:
- Use the mouse to move the player object (mouse has to stay in the canvas)
- Use "Space" or click on "Start Game" to start the game
- Use "R" or click on "Reset Game" to restart the game

Winning condition:
- The game is won when the ball hits the golden object in the middle of the other objects

Losing condition:
- The game is lost when the ball hits the bottom of the canvas
- The score will then be reset to 0

Scoring system:
- Hit a green object: +3 points
- Hit a blue object: +2 points
- Hit a red object: +1 point
- Everytime the ball hits an object the speed of the ball will be multiplied by 1.1
-> The goal is to get as many points as possible when the game is won
