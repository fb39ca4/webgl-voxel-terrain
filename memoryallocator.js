function MemoryAllocator(size) {
    this.size = size
    var startingBlock = {
        start: 0,
        size: size,
        free: true,
        prev: null,
        next: null,
    }
    startingBlock.prev = startingBlock;
    startingBlock.next = startingBlock;
    this.allocIdx = startingBlock;
    this.allocated = {};
}

MemoryAllocator.prototype.allocate = function(size) {
    var block = this.allocIdx;
    do {
        if (block.free === true) {
            if (block.size >= size) {
                this.splitBlock(block, size);
                this.allocIdx = block.next;
                this.allocated[block.start] = block;
                return block.start;
            }
        }
        block = block.next;
    } while (block !== this.allocIdx);
    throw new Error("Could not find free block of sufficient size");
}

MemoryAllocator.prototype.free = function(ptr) {
    var block = this.find(ptr);
    if (block.free === true) return false;
    block.free = true;
    this.consolidateNext(block);
    this.consolidatePrev(block);
    delete this.allocated[block.start];
    return true;
}

MemoryAllocator.prototype.find = function(ptr) {
    var block = this.allocated[ptr];
    if (!block) throw new Error("Could not find block");
    else return block;
}

MemoryAllocator.prototype.consolidateNext = function(block) {
    if (block.free !== true) throw new Error("Cannot consolidate occupied block");
    var nextBlock = block.next;
    if (nextBlock.free !== true) return false;
    if (nextBlock.start <= block.start) return false;
    if (this.allocIdx === nextBlock) this.allocIdx = block;
    block.size += nextBlock.size;
    block.next = nextBlock.next;
    block.next.prev = block;
}

MemoryAllocator.prototype.consolidatePrev = function(block) {
    if (block.free !== true) throw new Error("Cannot consolidate occupied block");
    var prevBlock = block.prev;
    if (prevBlock.free !== true) return false;
    if (prevBlock.start >= block.start) return false;
    if (this.allocIdx === prevBlock) this.allocIdx = block;
    block.size += prevBlock.size;
    block.start -= prevBlock.size;
    block.prev = prevBlock.prev;
    block.prev.next = block;
}


MemoryAllocator.prototype.splitBlock = function(block, size) {
    if (block.free !== true) throw new Error("Cannot split occupied block");
    block.free = false;
    if (size < block.size) {
        var newBlock = {
            start: block.start + size,
            size: block.size - size,
            free: true,
            next: block.next,
            prev: block,
        }
        newBlock.next.prev = newBlock;
        block.next = newBlock;
        block.size = size;
    }
}

/*function AllocTester(bufferSize, numBlocks, minBlockSize, maxBlockSize) {
    this.bufMan = new MemoryAllocator(0, bufferSize, 1);
    var b = this.bufMan;
    this.ptrs = [];
    this.minBlockSize = minBlockSize;
    this.maxBlockSize = maxBlockSize;
    for (var i = 0; i < numBlocks; i++) this.ptrs.push(this.bufMan.allocate(this.randSize()));
}

AllocTester.prototype.randInt = function(max) {
    var r = Math.random();
    return (r * max) | 0;
}

AllocTester.prototype.randSize = function() { return 1 + this.minBlockSize + this.randInt(this.maxBlockSize - this.minBlockSize);}
AllocTester.prototype.testAllocate = function() {
    this.ptrs.push(this.bufMan.allocate(this.randSize()));
}
AllocTester.prototype.testFree = function() {
    var idx = this.randInt(this.ptrs.length);
    var ptr = this.ptrs[idx];
    this.ptrs.splice(idx, 1);
    this.bufMan.free(ptr);
}
AllocTester.prototype.test = function(n, count) {
    var time = performance.now();
    count = count || 1;
    for (var i = 0; i < count; i++) {
        for (var j = 0; j < n; j++) {
            this.testFree();
        }
        for (var j = 0; j < n; j++) {
            this.testAllocate();
        }
    }
    return performance.now() - time;
}

a = new AllocTester(1048576, 1024, 512);
a.test(60, 600);
a.test(60, 600);
a.test(60, 6000);*/
