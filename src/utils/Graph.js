// Taken from https://stackoverflow.com/questions/32527026/shortest-path-in-javascript/32527538
// by Michael Laszlo

export function Graph() {
    var neighbors = this.neighbors = {}; // Key = vertex, value = array of neighbors.
 
    this.addEdge = function (u, v) {
        if (neighbors[u] === undefined) {  // Add the edge u -> v.
            neighbors[u] = [];
        }
        neighbors[u].push(v);
        if (neighbors[v] === undefined) {  // Also add the edge v -> u in order
            neighbors[v] = [];               // to implement an undirected graph.
        }                                  // For a directed graph, delete
        neighbors[v].push(u);              // these four lines.
    };
 
    return this;
}
 
export function bfs(graph, source) {
    var queue = [ { vertex: source, count: 0 } ],
        visited = { source: true },
        tail = 0;
    while (tail < queue.length) {
        var u = queue[tail].vertex,
            count = queue[tail++].count;  // Pop a vertex off the queue.
        // print('distance from ' + source + ' to ' + u + ': ' + count);
        graph.neighbors[u].forEach(function (v) {
            if (!visited[v]) {
                visited[v] = true;
                queue.push({ vertex: v, count: count + 1 });
            }
        });
    }
}
 
export function shortestPath(graph, source, target) {
    if (source === target) {   // Delete these four lines if
        print(source);          // you want to look for a cycle
        return;                 // when the source is equal to
    }                         // the target.
    var queue = [ source ],
        visited = { source: true },
        predecessor = {},
        tail = 0;
    while (tail < queue.length) {
        var u = queue[tail++],  // Pop a vertex off the queue.
            neighbors = graph.neighbors[u];
        for (var i = 0; i < neighbors.length; ++i) {
            var v = neighbors[i];
            if (visited[v]) {
                continue;
            }
            visited[v] = true;
            if (v === target) {   // Check if the path is complete.
                var path = [ v ];   // If so, backtrack through the path.
                while (u !== source) {
                    path.push(u);
                    u = predecessor[u];
                }
                path.push(u);
                path.reverse();
                //print(path.join(' -> '));
                return path;
            }
            predecessor[v] = u;
            queue.push(v);
        }
    }
    print('there is no path from ' + source + ' to ' + target);
}
 
function print(s) {  // A quick and dirty way to display output.
    console.log(s);
}
export default {print, Graph, bfs, shortestPath};