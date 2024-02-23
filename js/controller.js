angular.module('pokeApp.controlador', []);


app.controller('main-controller', ['$scope', '$http', '$q', '$document', '$timeout', 'filterFilter', function($scope, $http, $q, $document, $timeout, filterFilter){

    $scope.titleApp = 'PokeApp';
    $scope.api = 'https://pokeapi.co/api/v2/pokemon';
    $scope.abc = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
    
    $scope.prev = '';
    $scope.next = '';
    $scope.page = '';

    $scope.limit = 20;
    $scope.currentPage = 0;
    
    $scope.mostrarDetalle = false;  
    $scope.cargandoPokemon = false;
    $scope.cargando = false;
    
    $scope.pokemons = [];
    $scope.totalPages = []; 
    $scope.tablaResumen = [];

    $scope.buscarPokemon = {};  

    $scope.getPokemons = query => {
        
        $scope.cargando = true;

        $scope.pokemons = [];
        $scope.prev = '';
        $scope.next = '';

        $timeout( () =>  {

            $http.get(query) 
                .then( 
                    data => {
                        $scope.pokemons = data.data.results; 

                        $scope.prev = data.data.previous;
                        $scope.next = data.data.next;
 
                        $scope.total = data.data.count;

                    }, 
                    error => console.warn('No se cargo la data', error)
                )
                .catch( err => console.log(err) )
                .finally( () => $scope.loadTable() )
                
        }, 500)
  
    } 

    $scope.loadTable = () => {
        $scope.pokemons.forEach( (poke, i) => { 
            $http.get(poke.url).then(
                data => { 
                    let { name, types, sprites } = data.data;
                    $scope.pokemons[i] =  {
                        img: sprites.front_default, 
                        name,
                        types,
                        url: poke.url
                    }
                }, 
                error => console.warn('No se pudo cargar pokemon', error)
            )
            .catch( err => console.error( err ) )
            .finally( () => {
                $scope.cargando = false; 
            })
        })
        
    } 

    $scope.mostrarLista = e => {
        document.getElementById('lista').classList.add('active');
    }

    $scope.seleccionarPokemonLista = (e, url) => { 
        document.getElementById('lista').classList.remove('active');
        e.target.parentElement.classList.remove('active'); 
        $scope.getPokemon(url);
    }

    $scope.getPokemon = url => { 

        $scope.pokemon = [];

        $scope.cargandoPokemon = true;
        $scope.mostrarDetalle = false;
 
        $http.get(url).then(
            data => {

                let { abilities, cries, name, height, moves, types, sprites, stats, weight } = data.data; 

                $scope.pokemon =  {
                    img: sprites.front_default,
                    imgBack: sprites.back_default,
                    name,
                    types,
                    weight,
                    height,
                    abilities,
                    moves,
                    stats,
                    sonido: cries.legacy
                };

            }, 
            error => console.warn('No se pudo cargar pokemon', error)
        )
        .catch( err => console.error( err ) )
        .finally( () => {
            $scope.mostrarDetalle = true; 
            $scope.cargandoPokemon = false;
        })   
    }  

    // pagination

    $scope.onPrev = () => {
        let index = $scope.prev.split('?')[1].split('&')[0].split('=')[1];
        $scope.buscarPokemon = '';
        $scope.currentPage = (index / $scope.limit) + 1;
        $scope.getPokemons($scope.prev);
    }
    $scope.onNext = () => {
        let index = $scope.next.split('?')[1].split('&')[0].split('=')[1];
        $scope.buscarPokemon = '';
        $scope.currentPage = (index / $scope.limit) + 1;
        $scope.getPokemons($scope.next);
    }
    $scope.onPage = index => {
        $scope.buscarPokemon = '';
        $scope.currentPage = index + 1;
        $scope.getPokemons(`${$scope.api}?offset=${index*$scope.limit}&limit=${$scope.limit}`)
    ;}

    $scope.inicializarPaginador = () =>  {
        $timeout( () => {
            let totalPaginas = Math.ceil($scope.total / $scope.limit); 
            for(let i = 1; i < totalPaginas; i++){
                $scope.totalPages.push(i);
            }
        },1000) 
        $scope.currentPage = 1; 
    }

    $scope.resumen = () => {
        $timeout( () => {

            $http.get('https://pokeapi.co/api/v2/pokemon?limit=2000') 
            .then( 
                data => $scope.pokemonsResumen = data.data.results, 
                error => console.warn('No se cargo la data', error)
            )
            .catch( err => console.log(err) )
            .finally( () => { 
                $scope.abc.forEach( l => { 
                    let result = $scope.pokemonsResumen.filter(e => e.name[0] === l).length; 
                    $scope.tablaResumen.push( { letra: l, cantidad: result } )  
                })
 
            }) 
        },1000) 
    }

    $scope.initApp = () => { 
        $scope.getPokemons(`${$scope.api}?offset=0&limit=${$scope.limit}`);
        $scope.inicializarPaginador();
        $scope.resumen();
    }

    $scope.initApp();

}]);