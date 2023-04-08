#http://www.manongjc.com/detail/51-wybgtxykomkmmta.html
from OpenGL.arrays import vbo

from OpenGL.GL import *
from OpenGL.GLUT import *
from OpenGL.GLU import *

import math
import numpy as ny 

class common:
     bCreate = False

#球的实现
class sphere(common):
    def __init__(this,rigns,segments,radius):
        this.rigns = rigns
        this.segments = segments
        this.radius = radius
    def createVAO(this):
        vdata = []
        vindex = []
        for y in range(this.rigns):
            phi = (float(y) / (this.rigns - 1)) * math.pi
            for x in range(this.segments):
                theta = (float(x) / float(this.segments - 1)) * 2 * math.pi
                vdata.append(this.radius * math.sin(phi) * math.cos(theta))
                vdata.append(this.radius * math.cos(phi))
                vdata.append(this.radius * math.sin(phi) * math.sin(theta))
                vdata.append(math.sin(phi) * math.cos(theta))
                vdata.append(math.cos(phi))
                vdata.append(math.sin(phi) * math.sin(theta))
        for y in range(this.rigns - 1):
            for x in range(this.segments - 1):
                vindex.append((y + 0) * this.segments + x)
                vindex.append((y + 1) * this.segments + x)
                vindex.append((y + 1) * this.segments + x + 1)
                vindex.append((y + 1) * this.segments + x + 1)
                vindex.append((y + 0) * this.segments + x + 1)
                vindex.append((y + 0) * this.segments + x)
        this.vbo = vbo.VBO(ny.array(vdata,'f'))
        this.ebo = vbo.VBO(ny.array(vindex,'H'),target = GL_ELEMENT_ARRAY_BUFFER)
        this.vboLength = this.segments * this.rigns
        this.eboLength = len(vindex)
        this.bCreate = True
    def drawShader(this,vi,ni,ei):
        if this.bCreate == False:
            this.createVAO()
        this.vbo.bind()
    def draw(this):
        if this.bCreate == False:
            this.createVAO()
        this.vbo.bind()
        glInterleavedArrays(GL_N3F_V3F,0,None)
        this.ebo.bind()
        glDrawElements(GL_TRIANGLES,this.eboLength,GL_UNSIGNED_SHORT,None)  

class plane(common):
     def __init__(this,xres,yres,xscale,yscale):
         this.xr,this.yr,this.xc,this.yc = xres - 1,yres - 1,xscale,yscale
     def createVAO(this):
         helfx = this.xr * this.xc * 0.5
         helfy = this.yr * this.yc * 0.5
         vdata = []
         vindex = []
         for y in range(this.yr):
             for x in range(this.xr):
                 vdata.append(this.xc * float(x) - helfx)
                 vdata.append(0.)
                 vdata.append(this.yc * float(y) - helfy)
         for y in range(this.yr - 1):
             for x in range(this.xr - 1):
                 vindex.append((y + 0) * this.xr + x)
                 vindex.append((y + 1) * this.xr + x)
                 vindex.append((y + 0) * this.xr + x + 1)
                 vindex.append((y + 0) * this.xr + x + 1)
                 vindex.append((y + 1) * this.xr + x)
                 vindex.append((y + 1) * this.xr + x + 1)
         print (len(vdata),len(vindex))
         this.vbo = vbo.VBO(ny.array(vdata,'f'))
         this.ebo = vbo.VBO(ny.array(vindex,'H'),target = GL_ELEMENT_ARRAY_BUFFER)
         this.eboLength = len(vindex)
         this.bCreate = True
     def draw(this):
         if this.bCreate == False:
             this.createVAO()
         this.vbo.bind()
         glInterleavedArrays(GL_V3F,0,None)
         this.ebo.bind()
         glDrawElements(GL_TRIANGLES,this.eboLength,GL_UNSIGNED_SHORT,None)   

class camera:#摄像机漫游
     origin = [0.0,0.0,0.0]
     length = 1.
     yangle = 0.
     zangle = 0.
     __bthree = False
     def __init__(this):
         this.mouselocation = [0.0,0.0]
         this.offest = 0.1#0.01
         this.zangle = 0. if not this.__bthree else math.pi
     def setthree(this,value):
         this.__bthree = value
         this.zangle = this.zangle + math.pi
         this.yangle = -this.yangle          
     def eye(this):
         return this.origin if not this.__bthree else this.direction()
     def target(this):
         return this.origin if this.__bthree else this.direction()
     def direction(this):
         if this.zangle > math.pi * 2.0 :
             this.zangle < - this.zangle - math.pi * 2.0
         elif this.zangle < 0. :
             this.zangle < - this.zangle + math.pi * 2.0
         len = 1. if not this.__bthree else this.length if 0. else 1.
         xy = math.cos(this.yangle) * len
         x = this.origin[0] + xy * math.sin(this.zangle)
         y = this.origin[1] + len * math.sin(this.yangle)
         z = this.origin[2] + xy * math.cos(this.zangle)        
         return [x,y,z]
     def move(this,x,y,z):
         print("move",x,y,z)
         sinz,cosz = math.sin(this.zangle),math.cos(this.zangle)        
         xstep,zstep = x * cosz + z * sinz,z * cosz - x * sinz
         if this.__bthree : 
             xstep = -xstep
             zstep = -zstep
         this.origin = [this.origin[0] + xstep,this.origin[1] + y,this.origin[2] + zstep]        
     def rotate(this,z,y):
         this.zangle,this.yangle = this.zangle - z,this.yangle + y if not this.__bthree else -y
     def setLookat(this):
         ve,vt = this.eye(),this.target()
         #print ve,vt
         glLoadIdentity()
         gluLookAt(ve[0],ve[1],ve[2],vt[0],vt[1],vt[2],0.0,1.0,0.0)        
     def keypress(this,key,x,y):
         print("key",key,key in ('e',b'e'))
         if key in ('e', 'E',b'e', b'E'):
             print(key,this.offest)
             this.move(0.,0.,1 * this.offest)
         if key in (b'f', b'F'):
             this.move(1 * this.offest,0.,0.)
         if key in (b's', b'S'):
             this.move(-1 * this.offest,0.,0.)
         if key in (b'd', b'D'):
             this.move(0.,0.,-1 * this.offest)
         if key in (b'w', b'W'):
             this.move(0.,1 * this.offest,0.)
         if key in (b'r', b'R'):
             this.move(0.,-1 * this.offest,0.)
         if key in (b'v', b'V'):
             #this.__bthree = not this.__bthree
             this.setthree(not this.__bthree)
         if key == GLUT_KEY_UP:
             this.offest = this.offest + 0.1
         if key == GLUT_KEY_DOWN:
             this.offest = this.offest - 0.1
     def mouse(this,x,y):  
         rx = (x - this.mouselocation[0]) * this.offest * 0.1
         ry = (y - this.mouselocation[1]) * this.offest * -0.1
         this.rotate(rx,ry)
         print(x,y)
         this.mouselocation = [x,y]

if __name__ == '__main__': 
 sph = sphere(16,16,1)#common.sphere(16,16,1)
 camera = camera()#common.camera()
 plane = plane(12,12,1.,1.)#common.plane(12,12,1.,1.)
 def InitGL(width,height):
     glClearColor(0.1,0.1,0.5,0.1)
     glClearDepth(1.0)
     glPolygonMode(GL_FRONT_AND_BACK, GL_LINE)
     glMatrixMode(GL_PROJECTION)
     glLoadIdentity()
     gluPerspective(45.0,float(width)/float(height),0.1,100.0)    
     camera.move(0.0,3.0,-5)    
     
 def DrawGLScene():
     glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
     glMatrixMode(GL_MODELVIEW)     
     camera.setLookat()
     plane.draw() 
     glTranslatef(-1.5,0.0,0.0)
     glBegin(GL_QUADS)                  
     glVertex3f(-1.0, 1.0, 0.0)          
     glVertex3f(1.0, 1.0, 0.0)           
     glVertex3f(1.0, -1.0, 0.0)          
     glVertex3f(-1.0, -1.0, 0.0)        
     glEnd()    
     glTranslatef(3.0, 0.0, 0.0)
     sph.draw()                         
     glutSwapBuffers()
 
 def mouseButton( button, mode, x, y ):    
     if button == GLUT_RIGHT_BUTTON:
         camera.mouselocation = [x,y]
 
 def ReSizeGLScene(Width, Height): 
     glViewport(0, 0, Width, Height)        
     glMatrixMode(GL_PROJECTION)
     glLoadIdentity()
     gluPerspective(45.0, float(Width)/float(Height), 0.1, 100.0)
     glMatrixMode(GL_MODELVIEW)
     
 def main():
     glutInit()
     glutInitDisplayMode(GLUT_RGBA | GLUT_DOUBLE | GLUT_DEPTH)
     glutInitWindowSize(640,400)
     glutInitWindowPosition(800,400)
     glutCreateWindow("opengl")

     glutDisplayFunc(DrawGLScene)
     glutIdleFunc(DrawGLScene)
     glutReshapeFunc(ReSizeGLScene)
     glutMouseFunc( mouseButton )
     
     glutMotionFunc(camera.mouse)
     glutKeyboardFunc(camera.keypress)
     glutSpecialFunc(camera.keypress)

     InitGL(640, 480)
     
     glutMainLoop()
 
 main()

