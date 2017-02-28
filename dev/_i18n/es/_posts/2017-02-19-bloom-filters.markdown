---
layout: post
title:  "Bloom filters en Ruby"
categories: data-structures ruby
permalink: bloom/
---
<link rel="stylesheet" href="/css/styles.css">

Es sabido que grandes peligros acechan en las profundidades de Internet. Cualquiera podría fácilmente caer víctima de un sitio malicioso con una simple búsqueda o al hacer clic aleatoriamente en cualquier link que encontremos en el camino. Pero en Google Chrome, antes de ingresar a cualquier sitio malicioso, aparece la siguiente advertencia:


{% include image.html url="/assets/malware.png" description="Podes probar esto con Chrome yendo a malware.testing.google.test/testing/malware/" %}


Esto funciona bastante bien como método de prevención, salvando al usuario de una posible infección. Pero, ¿cómo sabe realmente Chrome que este sitio en particular es malévolo?. Una posible solución es que Chrome tenga almacenado en una base de datos una gran cantidad de URLs correspondientes a los sitios maliciosos. Y esto tiene que hacerse localmente, porque no queremos perder tiempo enviando una solicitud a un servidor de Google cada vez que visitamos una página web. Pero guardar todos estos datos localmente, ¿no tomaría mucho espacio en el disco?. Entonces, ¿cómo hace esto Chrome eficientemente? La respuesta es usando una estructura de datos especial llamada *Bloom Filters*. Chrome utiliza esta estructura de datos para resolver el problema, así como también lo hacen Bitcoin, Cassandra, BigTable y otros para diferentes problemas.


## Así que necesitamos Bloom Filters...

¿Bloom Filters? ¿Qué es eso? Un Bloom Filter es una estructura de datos probabilística que puede responder si un elemento en particular está contenido dentro de un conjunto o no. Esto se hace rápida y eficientemente, requiriendo poca memoria. El truco para lograr esto se basa en su naturaleza **probabilística**. La estructura de datos es probabilística en el sentido de que podemos encontrar **falsos positivos** en algunas de nuestras consultas. Esto significa que para alguna consulta, puede devolver **true** (con alguna probabilidad) para un elemento que **no está realmente en el conjunto**. Pero en nuestro ejemplo de malware y muchas otras aplicaciones, es aceptable tener falsos positivos si esto implica tener una solución rápida y de bajo costo. Podríamos encontrar una web erróneamente marcada como maliciosa, pero vamos a ver más adelante que esto no es común.



A simple vista, parece ser una estructura difícil de implementar, pero de hecho termina siendo muy fácil. Vamos ahora a codear un Bloom Filter con Ruby. Nuestro Bloom Filter se va a basar en Bitfields: simples arrays de ceros y unos, almacenados directamente en formato binario. Este es el secreto para lograr un uso bajo de memoria, cada byte contiene ocho elementos del Bitfield. El Bloom Filter tiene dos funciones principales: añadir un elemento y buscar un elemento. Para añadir un elemento a la estructura ciertos bits se setean en uno, y al buscar ese elemento, comprueba si esos mismos bits están seteados. Para lograr esto, debemos cuidar de **hashear** cada elemento apropiadamente. Y nada más, es así de simple.


Esto implica varias cosas. En realidad, no estamos guardando el elemento con toda su información (una URL entera en nuestro ejemplo), sino sólo su hash. Por lo tanto, sólo podemos preguntar si un elemento está incluido o no dentro del conjunto, pero no podemos recuperar información acerca de esos elementos. Esto también significa que no podemos pedir a la estructura que nos proporcione una lista de los elementos que ya fueron incluidos en el conjunto. Si pudieramos examinar el Bloom Filter que utiliza Chrome, no podríamos saber qué URLs maliciosas están incluidas en él. Tampoco no tenemos un método de eliminación de elementos, esta es otra desventaja de la estructura. Depende del programador y de la naturaleza del problema si estas desventajas son aceptables o no.



## ¡Vamos a implementarlo!

Para implementar esto en Ruby utilicé un Bitfield que encontré [aquí] [bitfield] (créditos al autor original). Al tener esa parte ya resuelta, empecemos con el Bloom Filter per se. En primer lugar, ¿cómo sabemos si nuestra estructura está vacía? Eso es fácil, si agrego cualquier elemento, entonces significa que habrá un bit seteado en 1. Si no agregué nada al filtro, todos los bits son 0:

{% highlight ruby %}
def empty?
  is_empty = true
  @filter.each{|bit| is_empty &= (bit == 0)}
  is_empty
end
{% endhighlight %}





Antes de pensar en los métodos de añadir y buscar, necesito saber cómo hashear elementos. Es sencillo en Ruby:

{% highlight ruby %}
def hashes(elem)
  hash = Digest::MD5.hexdigest(elem)
  [hash[0..8],hash[9..16],hash[17..24], hash[24..32]]
end
{% endhighlight %}



Uso MD5 para hashear, y luego divido el resultado en cuatro partes. MD5 se utiliza sólo como un ejemplo, porque esto es sólo una implementación de juguete. MD5 **es más lento de lo necesario** para esta estructura, hay otros hash más convenientes para esta aplicación como el [murmur hash] [murmur]. También estoy dividiendo el resultado en cuatro partes, cada parte seteará un **bit diferente** en nuestro bitfield. Yo uso cuatro partes, pero podrían ser más o podrían ser menos. Cambiar el número de partes afectará el número de bits seteados en cada operación y, en última instancia, la **probabilidad de falsos positivos**.


Ahora si podemos tener un método add. Para añadir un nuevo elemento primero lo hasheamos, y para cada una de las partes de ese hash resultante, ponemos un bit en el bitfield:

{% highlight ruby %}
def add(elem)
  hashes(elem).each {|hash|
    @filter[hash.to_i(16) % @filter_size] = 1
  }
end
{% endhighlight %}




Para buscar, repetimos el procedimiento. Hasheamos el elemento, y para cada parte, verificamos si ese bit está seteado en 1:

{% highlight ruby %}
def query(elem)
  hash = hashes(elem)
  is_elem = true
  hashes(elem).each {|hash|
    is_elem &= (@filter[hash.to_i(16) % @filter_size] == 1)
  }
  return is_elem
end
{% endhighlight %}


Hay que tener en cuenta que algunos hashes pueden colisionar y entonces el programa seteará un bit que ya estaba seteado en 1 por otros elementos. Aquí es de donde provienen los falsos positivos: varios elementos pueden tener el mismo hash. Si pregunto por un elemento que realmente no está en mi filtro, puede suceder que **otros elementos** ya hayan seteado esos bits en 1. Así que el método de búsqueda va a decir que mi elemento está incluido en el conjunto cuando realmente no lo está. Algo curioso que resulta de todo esto: si todos los bits de mi filtro estan seteados, mi estructura devolverá true para absolutamente todos los elementos posibles en el universo. Si mi Bloom Filter de URLs está lleno, encontraré una manzana o un coche si los hashié.


Por suerte, tenemos una fórmula para saber aproximadamente cuántos elementos tiene el Bloom Filter:

{% highlight ruby %}
def approx_size
  n = @filter_size
  x = @filter.to_s.count '1'
  k = 4
  -n * Math.log(1- x.to_f/n) / k
end
{% endhighlight %}


Donde ** n ** es el tamaño de mi Bloom Filter, ** x ** es el número de bits seteados en uno y ** k ** es el número de hashes (que, en nuestro caso, es 4). Haciendo un par de pruebas, esta fórmula termina siendo sorprendentemente precisa.

Una vez más, esto es sólo una implementación de juguete y no es para nada adecuado para un entorno de producción. ¡Espero que les haya gustado!


[bitfield]: https://dzone.com/articles/bitfield-fastish-pure-ruby-bit
[murmur]: https://en.wikipedia.org/wiki/MurmurHash
