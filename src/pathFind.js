export default function pathFind(_from, _target, _isWalkAbleFn) {

    let endPositionKey = [_target.x, _target.y].join("-");
    let visited = {};
    let listNodes = [];
    let bestpath = null;
    let dir = [
        [1, 0], [0, 1], [-1, 0], [0, -1]
    ];
    let hittest = function (p) {
        return _isWalkAbleFn(p[0], p[1]);
    }
    function interation() {
        let cantmovemore = false;
        let cicles = 0;
        // ITERAMOS CADA CICLO 
        while (bestpath == null || cantmovemore) {
            cicles++;
            // EN CADA CICLO TENEMOS UNOS NODOS
            let newNodes = [];
            // ITREAMOS LOS ULTIMOS NODOS GUARDADADOS
            for (let k in listNodes) {
                // CADA UNO DE ESTOS NODOS ES EL PADRE DE NUEVOS NODOS
                let _parentnode = listNodes[k];
                // LOS NUEVOS NODOS ESTARAN EN CADA DIRECCION
                for (let i in dir) {
                    // 
                    let vel = dir[i];
                    let p = [_parentnode.x + vel[0], _parentnode.y + vel[1]];
                    // SI ESTA NUEVA POSITION NO LA HEMOS VISITADO Y ES POSIBLE CAMINAR AQUI
                    if (!visited[p.join("-")] && hittest(p)) {
                        // CREAMOS UN NODO 
                        let _node = new Node(_parentnode, p);
                        // GUARDAMOS ESTE NUEVO NODO EN UNA NUEVA LISTA
                        newNodes.push(_node);
                    }
                }
            }

            // REMPLAZAMOS;
            listNodes = [].concat(newNodes);
            // SI NO PODEMOS MOVERMOS TERMINAMOS AQUI :(
            if (newNodes.length == 0) {
                cantmovemore = true;
                // CANT MOVE MORE.
                break;
            }
            // SI YA ESTA EL BEST PATH YA TERMINAMOS
            // EN CADA CICLO COMPARAMOS CUAL ES EL BEST PATH
        }
        return bestpath;
    }

    function Node(_parentnode, p) {
        this.x = p[0];
        this.y = p[1];
        visited[p.join("-")] = 1;
        // SI ESTE NODO ENCUENTRA LA POSICION FINAL
        if (p.join("-") === endPositionKey) {
            // LE DECIMOS AL PADRE DE ESTE NODO QUE LO ENCONTRAMOS
            _parentnode.foundcall([p]);
        }

        this.foundcall = function (child_p) {
            // EL HIJO DE ESTE NODO NOS AVISO QUE LO ENCONTRO  
            // AVISAMOS A NUESTRO PADRE QUE LO ENCONTRAMOS
            _parentnode.foundcall([p].concat(child_p))
        }
    }
    // MARCAMOS LA VISITA DE DONDE ESTAMOS
    visited[[_from.x, _from.y].join("-")] = 1;
    // CREAMOS EL PRIMER NODO EL NODO PAPA
    listNodes = [{
        x: _from.x,
        y: _from.y,
        foundcall: function (path) {
            if (bestpath == null || path.length < bestpath.length) {
                bestpath = path;
            }
        }
    }];
    interation([_from.x, _from.y]);
    if (bestpath == null) {
        //console.warn("COULD NOT FIND !!!")
        return null;//[[_from.x, _from.y]]
    }
    return bestpath;
}