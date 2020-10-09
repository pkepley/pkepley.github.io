---
layout: post
published: true
title: Groundhog Day T-Testing
subtitle: Looking at Punxsutawney Phil's Prognostications
tag: [Groundhog Day, t-test, replication analysis]
---

While looking for some details on t-tests, I ran across [this post from The Minitab Blog](https://blog.minitab.com/blog/quality-data-analysis-and-statistics/punxsutawney-phil-and-his-2-sample-t-test), which investigated Punxsutawney Phil's powers of prognostication. The authors of that post tested whether there was a statistically significant difference in the average monthly temperature in the months immediately following Phil's predictions when he saw his shadow vs when he didn't. Detecting an increase in mean temperature when Phil saw doesn't see his shadow would support Phil's prognostication claims. 

The original blog post used average temperature data for Pennsylvania over a 30 year period, but they were a bit opaque about the source of their data and didn't have year labels on their data. As such, I thought I'd perform a similar analysis with a slightly clearer data lineage and longer history. Since I don't use Minitab, I performed my analysis in Python.

For this analysis, I obtained monthly average temperature data from [NOAA's Global Summary of the Month](https://www.ncdc.noaa.gov/cdo-web/datasets#GSOM) for Jefferson County PA, which is where the borough of [Punxsutawney](https://en.wikipedia.org/wiki/Punxsutawney,_Pennsylvania) is located. Phil's predictions were sourced from the Wikipedia entry for [Punxsutawney Phil](https://en.wikipedia.org/wiki/Punxsutawney_Phil), however the data provided there were originally sourced from [Stormfax.com](http://www.stormfax.com/ghogday.htm). The temperature data and Wikipedia page, both sourced in Apr-2020, can be found in [this repository](https://github.com/pkepley/blog-notebooks/tree/master/20200418_GroundHog).

Here, we set up some package imports that we will use throughout.

```python
import sys, os, re, requests, urllib3, pathlib
from bs4 import BeautifulSoup
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.stats import ttest_ind
from IPython.core.display import display, HTML
```


```python
data_path = "./data/"
temperature_data_path = data_path + "/TempJeffersonCountyPA"
```

## Punxsutawney Phil Data

Because I didn't feel like copying down the data about Phil's predictions by hand, we will use Beautiful Soup to extract the data from the Wikipedia summary. To begin, we will need to download the Wikipedia entry if we don't already have it. The entry, downloaded on 04/17/2020, is included in the repository. (The page may have changed after that date, so it is included for reproducibility).


```python
ghog_pred_html = data_path + "/wiki_phil.html"

if not os.path.exists(ghog_pred_html):
    url = "https://en.wikipedia.org/wiki/Punxsutawney_Phil"
    req = requests.get(url)
    req_text = req.text
    
    with open(ghog_pred_html, 'w') as f:
        f.write(req_text)
        
else:
    with open(ghog_pred_html, 'r') as f:
        req_text = "".join(list(f))
```

Next we parse the Wikipedia entry. Here, we build the soup and find the table containing Phil's predictions.


```python
# build the soup
soup = BeautifulSoup(req_text, 'html.parser')

# find the only wikitable, which has the prognostications
table = soup.find('table', {'class' : 'wikitable'})
table_rows = table.find_all('tbody')

# We can throw away the table caption, since it links to 
# the original page
table.find("caption").decompose()
```

Next we'll render the table that we extracted. The table doesn't come with its legend, so we'll also render it. Some minor modifications of the original HTML were necessary in order to make this look nice in my notebook.


```python
# find the legend
legend = soup.find('div', attrs={'style' : 'float: left;'})
legend = legend.find("tbody")

# the legend was aligning right, so force it to align left
for div in legend.findAll("div", attrs={'class' : 'legend'}):
    div['style'] = 'text-align:left;'
    
# Render the html
display(HTML(table.prettify()))
display(HTML(legend.prettify()))
```

<div style="font-size:8pt;">
<table class="wikitable">
 <tbody>
  <tr>
   <td colspan="7">
   </td>
   <td style="background: azure;">
    1887
   </td>
   <td style="background: azure;">
    1888
   </td>
   <td style="background: grey;">
    1889
   </td>
  </tr>
  <tr>
   <td style="background: gold;">
    1890
   </td>
   <td style="background: grey;">
    1891
   </td>
   <td style="background: grey;">
    1892
   </td>
   <td style="background: grey;">
    1893
   </td>
   <td style="background: grey;">
    1894
   </td>
   <td style="background: grey;">
    1895
   </td>
   <td style="background: grey;">
    1896
   </td>
   <td style="background: grey;">
    1897
   </td>
   <td style="background: azure;">
    1898
   </td>
   <td style="background: grey;">
    1899
   </td>
  </tr>
  <tr>
   <td style="background: azure;">
    1900
   </td>
   <td style="background: azure;">
    1901
   </td>
   <td style="background: gold;">
    1902
   </td>
   <td style="background: azure;">
    1903
   </td>
   <td style="background: azure;">
    1904
   </td>
   <td style="background: azure;">
    1905
   </td>
   <td style="background: azure;">
    1906
   </td>
   <td style="background: azure;">
    1907
   </td>
   <td style="background: azure;">
    1908
   </td>
   <td style="background: azure;">
    1909
   </td>
  </tr>
  <tr>
   <td style="background: azure;">
    1910
   </td>
   <td style="background: azure;">
    1911
   </td>
   <td style="background: azure;">
    1912
   </td>
   <td style="background: azure;">
    1913
   </td>
   <td style="background: azure;">
    1914
   </td>
   <td style="background: azure;">
    1915
   </td>
   <td style="background: azure;">
    1916
   </td>
   <td style="background: azure;">
    1917
   </td>
   <td style="background: azure;">
    1918
   </td>
   <td style="background: azure;">
    1919
   </td>
  </tr>
  <tr>
   <td style="background: azure;">
    1920
   </td>
   <td style="background: azure;">
    1921
   </td>
   <td style="background: azure;">
    1922
   </td>
   <td style="background: azure;">
    1923
   </td>
   <td style="background: azure;">
    1924
   </td>
   <td style="background: azure;">
    1925
   </td>
   <td style="background: azure;">
    1926
   </td>
   <td style="background: azure;">
    1927
   </td>
   <td style="background: azure;">
    1928
   </td>
   <td style="background: azure;">
    1929
   </td>
  </tr>
  <tr>
   <td style="background: azure;">
    1930
   </td>
   <td style="background: azure;">
    1931
   </td>
   <td style="background: azure;">
    1932
   </td>
   <td style="background: azure;">
    1933
   </td>
   <td style="background: gold;">
    1934
   </td>
   <td style="background: azure;">
    1935
   </td>
   <td style="background: azure;">
    1936
   </td>
   <td style="background: azure;">
    1937
   </td>
   <td style="background: azure;">
    1938
   </td>
   <td style="background: azure;">
    1939
   </td>
  </tr>
  <tr>
   <td style="background: azure;">
    1940
   </td>
   <td style="background: azure;">
    1941
   </td>
   <td style="background: salmon;">
    1942
   </td>
   <td style="background: silver;">
    1943
   </td>
   <td style="background: azure;">
    1944
   </td>
   <td style="background: azure;">
    1945
   </td>
   <td style="background: azure;">
    1946
   </td>
   <td style="background: azure;">
    1947
   </td>
   <td style="background: azure;">
    1948
   </td>
   <td style="background: azure;">
    1949
   </td>
  </tr>
  <tr>
   <td style="background: gold;">
    1950
   </td>
   <td style="background: azure;">
    1951
   </td>
   <td style="background: azure;">
    1952
   </td>
   <td style="background: azure;">
    1953
   </td>
   <td style="background: azure;">
    1954
   </td>
   <td style="background: gold;">
    1955
   </td>
   <td style="background: azure;">
    1956
   </td>
   <td style="background: azure;">
    1957
   </td>
   <td style="background: azure;">
    1958
   </td>
   <td style="background: azure;">
    1959
   </td>
  </tr>
  <tr>
   <td style="background: azure;">
    1960
   </td>
   <td style="background: azure;">
    1961
   </td>
   <td style="background: azure;">
    1962
   </td>
   <td style="background: azure;">
    1963
   </td>
   <td style="background: azure;">
    1964
   </td>
   <td style="background: azure;">
    1965
   </td>
   <td style="background: azure;">
    1966
   </td>
   <td style="background: azure;">
    1967
   </td>
   <td style="background: azure;">
    1968
   </td>
   <td style="background: azure;">
    1969
   </td>
  </tr>
  <tr>
   <td style="background: gold;">
    1970
   </td>
   <td style="background: azure;">
    1971
   </td>
   <td style="background: azure;">
    1972
   </td>
   <td style="background: azure;">
    1973
   </td>
   <td style="background: azure;">
    1974
   </td>
   <td style="background: gold;">
    1975
   </td>
   <td style="background: azure;">
    1976
   </td>
   <td style="background: azure;">
    1977
   </td>
   <td style="background: azure;">
    1978
   </td>
   <td style="background: azure;">
    1979
   </td>
  </tr>
  <tr>
   <td style="background: azure;">
    1980
   </td>
   <td style="background: azure;">
    1981
   </td>
   <td style="background: azure;">
    1982
   </td>
   <td style="background: gold;">
    1983
   </td>
   <td style="background: azure;">
    1984
   </td>
   <td style="background: azure;">
    1985
   </td>
   <td style="background: gold;">
    1986
   </td>
   <td style="background: azure;">
    1987
   </td>
   <td style="background: gold;">
    1988
   </td>
   <td style="background: azure;">
    1989
   </td>
  </tr>
  <tr>
   <td style="background: gold;">
    1990
   </td>
   <td style="background: azure;">
    1991
   </td>
   <td style="background: azure;">
    1992
   </td>
   <td style="background: azure;">
    1993
   </td>
   <td style="background: azure;">
    1994
   </td>
   <td style="background: gold;">
    1995
   </td>
   <td style="background: azure;">
    1996
   </td>
   <td style="background: gold;">
    1997
   </td>
   <td style="background: azure;">
    1998
   </td>
   <td style="background: gold;">
    1999
   </td>
  </tr>
  <tr>
   <td style="background: azure;">
    2000
   </td>
   <td style="background: azure;">
    2001
   </td>
   <td style="background: azure;">
    2002
   </td>
   <td style="background: azure;">
    2003
   </td>
   <td style="background: azure;">
    2004
   </td>
   <td style="background: azure;">
    2005
   </td>
   <td style="background: azure;">
    2006
   </td>
   <td style="background: gold;">
    2007
   </td>
   <td style="background: azure;">
    2008
   </td>
   <td style="background: azure;">
    2009
   </td>
  </tr>
  <tr>
   <td style="background: azure;">
    2010
   </td>
   <td style="background: gold;">
    2011
   </td>
   <td style="background: azure;">
    2012
   </td>
   <td style="background: gold;">
    2013
   </td>
   <td style="background: azure;">
    2014
   </td>
   <td style="background: azure;">
    2015
   </td>
   <td style="background: gold;">
    2016
   </td>
   <td style="background: azure;">
    2017
   </td>
   <td style="background: azure;">
    2018
   </td>
   <td style="background: gold;">
    2019
   </td>
  </tr>
  <tr>
   <td style="background: gold;">
    2020
   </td>
  </tr>
 </tbody>
</table>


<br>

<tbody>
 <tr>
  <td>
   <div class="legend" style="text-align:left;">
    <span class="legend-color" style="display:inline-block; width:1.5em; height:1.5em; margin:1px 0; border:1px solid black; background-color:azure; color:black; font-size:100%; text-align:center;">
    </span>
    "Long winter" (103)
   </div>
   <div class="legend" style="text-align:left;">
    <span class="legend-color" style="display:inline-block; width:1.5em; height:1.5em; margin:1px 0; border:1px solid black; background-color:gold; color:black; font-size:100%; text-align:center;">
    </span>
    "Early spring" (20)
   </div>
   <div class="legend" style="text-align:left;">
    <span class="legend-color" style="display:inline-block; width:1.5em; height:1.5em; margin:1px 0; border:1px solid black; background-color:salmon; color:black; font-size:100%; text-align:center;">
    </span>
    <!--<a href="/wiki/World_War_II" title="World War II">-->
    "War clouds
    <!--</a>-->
    have blacked out parts of the shadow." (1)
   </div>
   <div class="legend" style="text-align:left;">
    <span class="legend-color" style="display:inline-block; width:1.5em; height:1.5em; margin:1px 0; border:1px solid black; background-color:silver; color:black; font-size:100%; text-align:center;">
    </span>
    No appearance (1)
   </div>
   <div class="legend" style="text-align:left;">
    <span class="legend-color" style="display:inline-block; width:1.5em; height:1.5em; margin:1px 0; border:1px solid black; background-color:grey; color:black; font-size:100%; text-align:center;">
    </span>
    No record (9)
   </div>
  </td>
 </tr>
</tbody>
</div>


Next we parse the table and use the table's cell styles to determine whether Phil saw his shadow or not in each year. We will only retain the "Long Winter" (shadow) and "Early Spring" (no shadow) records, and will set all other records as missing.


```python
# get all of the entries in the table, cell contents are years 
# and style denotes if a shadow was seen or not
tds = table.find_all('td', style=True)
years  = [int(td.text) for td in tds]
styles = [td['style'] for td in tds]

# use the color coding to identify if a s
shadow = []
for s in styles:
    if "azure" in s:
        shadow.append(True)   # azure = SHADOW
    elif "gold" in s:
        shadow.append(False)  # gold = NO SHADOW
    else:
        shadow.append(np.nan) # sometimes no records, once war clouds
        
# Create a dataframe of the records
df_phil = pd.DataFrame({"year" : years, "shadow" : shadow})
df_phil = df_phil[~df_phil["shadow"].isnull()]
df_phil.head()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>year</th>
      <th>shadow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1887</td>
      <td>True</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1888</td>
      <td>True</td>
    </tr>
    <tr>
      <th>3</th>
      <td>1890</td>
      <td>False</td>
    </tr>
    <tr>
      <th>11</th>
      <td>1898</td>
      <td>True</td>
    </tr>
    <tr>
      <th>13</th>
      <td>1900</td>
      <td>True</td>
    </tr>
  </tbody>
</table>
</div>



## Temperature Data

NOAA's site only allows you to export a certain number of records at a time, so I had to split my export into two separate requests. Weather data is (partially) available for Jefferson County from 1892 onward, so I requested all records from June-1892 through March-2020. The dataset I received contained monthly temperature records from multiple stations in Jefferson County. For this analysis we will primarily be interested in the average temperature "TAVG." We'll drop the other columns and rename those columns that we do keep.


```python
temperature_data_files = os.listdir(temperature_data_path)
temperature_data_file_paths = [temperature_data_path + "/" + f for f in temperature_data_files]
df_temperature = pd.concat((pd.read_csv(f) for f in temperature_data_file_paths))

print("Data file names")
print("---------------")
for f in temperature_data_files: 
    print(f)

# Build the data frame. Only retain average
df_temperature.columns = [c.lower() for c in df_temperature.columns]
df_temperature['date'] = pd.to_datetime(df_temperature['date'])
df_temperature = df_temperature[['station', 'date', 'tavg']]
df_temperature = df_temperature.rename(columns = {'tavg' : 't_avg'})
df_temperature = df_temperature.dropna()
df_temperature.head()
```

    Data file names
    ---------------
    jefferson_county_pa_temp_189206_195005.csv
    jefferson_county_pa_temp_195006_202003.csv





<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>station</th>
      <th>date</th>
      <th>t_avg</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>USW00014741</td>
      <td>1926-01-01</td>
      <td>22.0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>USW00014741</td>
      <td>1926-02-01</td>
      <td>23.6</td>
    </tr>
    <tr>
      <th>2</th>
      <td>USW00014741</td>
      <td>1926-03-01</td>
      <td>28.3</td>
    </tr>
    <tr>
      <th>3</th>
      <td>USW00014741</td>
      <td>1926-04-01</td>
      <td>40.0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>USW00014741</td>
      <td>1926-05-01</td>
      <td>53.9</td>
    </tr>
  </tbody>
</table>
</div>



Since we're not especially interested in the individual stations' average monthly temperature, we'll average across stations to get a representative value for Jefferson County. Some additional columns are added for convenience later on.


```python
df_montly_temperature = df_temperature.groupby('date').mean().reset_index()
df_montly_temperature['month'] = pd.DatetimeIndex(df_montly_temperature['date']).month
df_montly_temperature['year']  = pd.DatetimeIndex(df_montly_temperature['date']).year
df_montly_temperature = df_montly_temperature[['date', 'year', 'month', 't_avg']]
df_montly_temperature.head()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>date</th>
      <th>year</th>
      <th>month</th>
      <th>t_avg</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1896-09-01</td>
      <td>1896</td>
      <td>9</td>
      <td>70.3</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1896-10-01</td>
      <td>1896</td>
      <td>10</td>
      <td>52.1</td>
    </tr>
    <tr>
      <th>2</th>
      <td>1896-11-01</td>
      <td>1896</td>
      <td>11</td>
      <td>47.1</td>
    </tr>
    <tr>
      <th>3</th>
      <td>1897-01-01</td>
      <td>1897</td>
      <td>1</td>
      <td>32.8</td>
    </tr>
    <tr>
      <th>4</th>
      <td>1897-02-01</td>
      <td>1897</td>
      <td>2</td>
      <td>43.6</td>
    </tr>
  </tbody>
</table>
</div>



Here we provide a scatter-plot of the average temperature for each station and compare to the mean across stations, which is plotted as a solid line. 


```python
fig, ax = plt.subplots(figsize = (10,5))
df_montly_temperature.plot(x = 'date', y = 't_avg', ax = ax, c='k', alpha=0.25)
sns.scatterplot(x='date', y='t_avg', hue='station', data=df_temperature, ax=ax)
plt.show()
```


![png]({{ url }}/assets/posts/img/GroundhogMeans_20200418/GroundhogMeanTemp_16_0.png)


Next we create a dataframe of the average temperature for February and March of each year. Some years were missing records for either February or March, so we'll exclude those years from our analysis. The mean for the two months is then computed as the simple average of each month's mean. In doing this, we are ignoring the fact that February has fewer days than March. A more careful analysis would not neglect this fact, but this should be good enough for our purposes. &#128578; 


```python
df_feb_mar_avg = (df_montly_temperature[(df_montly_temperature['month'] == 2) | (df_montly_temperature['month'] == 3)]
               .groupby('year')[['t_avg']]
               .agg(['count', 'mean']))
df_feb_mar_avg.columns = ['_'.join(col).strip() for col in df_feb_mar_avg.columns.values]
df_feb_mar_avg = df_feb_mar_avg.reset_index()
df_feb_mar_avg = df_feb_mar_avg[df_feb_mar_avg['t_avg_count'] == 2]
df_feb_mar_avg = df_feb_mar_avg[['year', 't_avg_mean']]
df_feb_mar_avg = df_feb_mar_avg.rename(columns = {'t_avg_mean' : 't_avg'})
```


```python
df_feb_mar_avg.head()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>year</th>
      <th>t_avg</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1897</td>
      <td>47.05</td>
    </tr>
    <tr>
      <th>3</th>
      <td>1900</td>
      <td>29.10</td>
    </tr>
    <tr>
      <th>4</th>
      <td>1901</td>
      <td>24.45</td>
    </tr>
    <tr>
      <th>6</th>
      <td>1911</td>
      <td>32.95</td>
    </tr>
    <tr>
      <th>7</th>
      <td>1912</td>
      <td>24.45</td>
    </tr>
  </tbody>
</table>
</div>



## 2-Sample Mean t-test

Finally we've got all of the data that we will need for the [t-test](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_ind.html). Let's merge the two dataframes together and throw away any years in which we are missing either a temperature measurement or a prediction from Phil.


```python
df_combined = pd.merge(df_phil, df_feb_mar_avg, left_on = "year", right_on = "year", how = "outer")
df_combined = df_combined.dropna()
df_combined.head()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>year</th>
      <th>shadow</th>
      <th>t_avg</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>4</th>
      <td>1900</td>
      <td>True</td>
      <td>29.10</td>
    </tr>
    <tr>
      <th>5</th>
      <td>1901</td>
      <td>True</td>
      <td>24.45</td>
    </tr>
    <tr>
      <th>15</th>
      <td>1911</td>
      <td>True</td>
      <td>32.95</td>
    </tr>
    <tr>
      <th>16</th>
      <td>1912</td>
      <td>True</td>
      <td>24.45</td>
    </tr>
    <tr>
      <th>17</th>
      <td>1913</td>
      <td>True</td>
      <td>33.85</td>
    </tr>
  </tbody>
</table>
</div>



Let's take a quick look at the mean temperature for Feb-March in years when Phil saw his shadow, as compared to the mean in years when he didn't see his shadow.


```python
df_combined.groupby('shadow').agg({'t_avg' : ['count', 'mean']})
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead tr th {
        text-align: left;
    }

    .dataframe thead tr:last-of-type th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr>
      <th></th>
      <th colspan="2" halign="left">t_avg</th>
    </tr>
    <tr>
      <th></th>
      <th>count</th>
      <th>mean</th>
    </tr>
    <tr>
      <th>shadow</th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>False</th>
      <td>16</td>
      <td>30.596875</td>
    </tr>
    <tr>
      <th>True</th>
      <td>89</td>
      <td>30.176966</td>
    </tr>
  </tbody>
</table>
</div>



The means are *pretty* similar, so I wouldn't expect our t-test to report a significant difference. Next we'll convert the temperature to vectors for the t-tests, plot the distribution of the means in each prediction class, and then we'll run the t-test. In the t-test, we'll assume the samples have the same variance, although Scipy can run [a test](https://en.wikipedia.org/wiki/Welch%27s_t-test) that allows for different variance between the different populations.


```python
avg_temp_shadow    = df_combined[df_combined['shadow'] == True ]['t_avg'].to_numpy().flatten()
avg_temp_no_shadow = df_combined[df_combined['shadow'] == False]['t_avg'].to_numpy().flatten()
```


```python
sns.distplot(avg_temp_shadow,    hist=False, label="Shadow")
sns.distplot(avg_temp_no_shadow, hist=False, label="No Shadow")
plt.show()
```


![png]({{ url }}/assets/posts/img/GroundhogMeans_20200418/GroundhogMeanTemp_26_0.png)



```python
ttest_rslt = ttest_ind(avg_temp_shadow, avg_temp_no_shadow, 
                       equal_var=False)

print("T-Test Result")
print("-------------")
print("t-value: {}".format(ttest_rslt.statistic))
print("p-value: {}".format(ttest_rslt.pvalue))
```

    T-Test Result
    -------------
    t-value: -0.4104841358882534
    p-value: 0.6859415624804476


The test shows that we failed to reject the null hypothesis that the two means were equal. As such, we cannot conclude that the means are different, but we also cannot conclude that the means are equal. That being said, it seems fairly likely that the means *are* the same, which reduces my confidence in Phil's prognostications a little bit. &#128578;
