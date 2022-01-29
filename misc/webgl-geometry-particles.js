function Particle() {
    this.position = new Vector3();
    this.velocity = new Vector3(1, 1, 0);
    this.lifetime = .7;
    this.timeAlive = 0;
    this.color = [1, 0, 0, 1]; 
}

function WebGLGeometryParticles(gl, maxParticles) {
	this.gl = gl;
    this.worldMatrix = new Matrix4();
    this.maxParticles = maxParticles || 1;
    this.particlePool = [];
    this.emissionRate = 20;

    this.webglPositionData = new Float32Array(this.maxParticles * 3);
    this.webglColorData = new Float32Array(this.maxParticles * 4);

    var accumulatedTime = 0;

	// -----------------------------------------------------------------------------
	this.create = function(rawImage) {
        // create the position and color information for this object and send it to the GPU
        this.vertexBuffer = gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.webglPositionData), gl.STATIC_DRAW);

        this.colorBuffer = gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.webglColorData), gl.STATIC_DRAW);

        if (rawImage) {
            this.texture = this.gl.createTexture();
            this.gl.bindTexture(gl.TEXTURE_2D, this.texture);
            // this.gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            this.gl.texImage2D(
                this.gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                rawImage
            );
            this.gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }
    
	// -------------------------------------------------------------------------
    this.update = function(dt, timeElapsed) {
        // this.webglPositionData[0] = Math.sin(timeElapsed);
        this.emit(dt, timeElapsed);

        // Update our webgl data from our collection of particles
        // iterate backward so we can easily remove while iterating
        for (var i = this.particlePool.length - 1; i >= 0; --i) {
            var currentParticle = this.particlePool[i];
            currentParticle.timeAlive += dt;

            if(currentParticle.timeAlive > currentParticle.lifetime) {
                this.particlePool.splice(i, 1);
                continue;
            }

            var displacement = currentParticle.velocity.clone().multiplyScalar(dt);
            currentParticle.position.add(displacement);

            var percentLife = currentParticle.timeAlive / currentParticle.lifetime;
            currentParticle.color[3] = 1.0 - percentLife;

            // Update positions
            this.webglPositionData[i * 3] = currentParticle.position.x;
            this.webglPositionData[i * 3 + 1] = currentParticle.position.y;
            this.webglPositionData[i * 3 + 2] = currentParticle.position.z;

            // update colors
            this.webglColorData[i * 4] = currentParticle.color[0];
            this.webglColorData[i * 4 + 1] = currentParticle.color[1];
            this.webglColorData[i * 4 + 2] = currentParticle.color[2];
            this.webglColorData[i * 4 + 3] = currentParticle.color[3];
        }

        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, this.webglPositionData, gl.STATIC_DRAW);

        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, this.webglColorData, gl.STATIC_DRAW);
    }

	// -------------------------------------------------------------------------
    this.emit = function(dt, timeElapsed) {
        accumulatedTime += dt;

        var timePerParticle = 1 / this.emissionRate;

        while (timePerParticle < accumulatedTime && this.particlePool.length != this.maxParticles) {
            var newParticle = new Particle();
            this.particlePool.push(new Particle());
            accumulatedTime -= timePerParticle;
        }
    }

	// -------------------------------------------------------------------------
	this.render = function(camera, projectionMatrix, shaderProgram) {
        if (this.particlePool.length == 0) {
            return;
        }

        gl.useProgram(shaderProgram);

        var attributes = shaderProgram.attributes;
        var uniforms = shaderProgram.uniforms;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(
            attributes.vertexPositionAttribute,
            3,
            gl.FLOAT,
            gl.FALSE,
            0,
            0
        );
        gl.enableVertexAttribArray(attributes.vertexPositionAttribute);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(
            attributes.vertexColorAttribute,
            4,
            gl.FLOAT,
            gl.FALSE,
            0,
            0
        );
        gl.enableVertexAttribArray(attributes.vertexColorAttribute);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(uniforms.textureUniform, this.texture);
        }

        // Send our matrices to the shader
        gl.uniformMatrix4fv(uniforms.worldMatrixUniform, false, this.worldMatrix.clone().transpose().elements);
        gl.uniformMatrix4fv(uniforms.viewMatrixUniform, false, camera.getViewMatrix().clone().transpose().elements);
        gl.uniformMatrix4fv(uniforms.projectionMatrixUniform, false, projectionMatrix.clone().transpose().elements);

        gl.drawArrays(gl.POINTS, 0, this.particlePool.length);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.disableVertexAttribArray(attributes.vertexPositionAttribute);
        gl.disableVertexAttribArray(attributes.vertexColorAttribute);
	}
}