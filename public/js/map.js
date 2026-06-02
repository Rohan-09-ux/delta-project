maplibregl.accessToken = mapToken;

const map = new maplibregl.Map({
    container: "map",

    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapToken}`,

    center: listing.geometry.coordinates,

    zoom: 9,
});

const marker = new maplibregl.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
        new maplibregl.Popup({ offset: 25 })
            .setHTML(
                `<h4>${listing.title}</h4>
                 <p>${listing.location}</p>
                 "<h3>Exact location is show after booking</h3>"`
            )
    )
    .addTo(map);

marker.togglePopup();