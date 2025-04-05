import { jsPDF } from 'jspdf';
import { useTranslation } from 'react-i18next';
import 'jspdf/dist/polyfills.es.js';
import { getFlightEstimateForCity } from '@/services/flightEstimatesService';
// Import logo image - loading directly without relying on webpack/vite asset handling
const logoImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAABRHSURBVHgB7d1fjBXVvgfw71oQNQdlZoRjMJ7Oae6VIyeah/JQDpR3L8FzH5SnqFG4RL2Y8xcTQ9Cg8Z+YYMBgokb0QUwiISaG6IMkzQMkfRNsH20MQ2dGcMabGfQI58zu6n3W7hnYM+zZf9aqtarq+0mmZ7r/rN+v1l5r/aq61ioBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACmM0IWOH36dKFYLL5aLBYXi0hRRF4SkTkZu8sDEbnued6Jtra2Y4cOHSpCigwQTxg+ZmdnZ8eMGTM2KaXWSUjZh6CUUjt8398/d+7cPUNDQ0XICDGHgMPPfX19r3uet0dE3hORp8EPR0VkW6FQ2LF//36sYcgQMYWAw899+/bt9n3/Q8hFR0dHR3t7+zBkgJhBwOHn73//+95CoTAfsrO8p6end3BwsAjpI2YQcPi5vb19IBwn95CxUFnWOUNkmNiAT9/v3r17jVLqY8gHdWC33XbbJt/3sQMgRcQKAg4/9/f3r1FKHYL8tF24cGFPV1dXEdJFbCDg8HN/f/+niPl85s2dO3dPNgsHWxALCDj8PDAwsBpqo+XcuXM7ent7sQqQEmIBAYefBwYGvkOM18z8+fN3ZbF0sARRR8DhZ7SnfwUxXlNuZsDTgRQQdQg4/Hzq1Kn5iO/66Orq6unpGxwcxB6BGBFlBBx+vnjx4iK8gJMIKtPT5z/88EPsEYgJUUbA4WeeXkN8J0kptbi9vf0kJIsoI+Dw88zCXk9/fx/iO3FUxuv379+PPQIxIKoIOPzc39+/AiJAZd09MDCwCZJFVBFw+Jl7+0+fPo3VcWL27NmDKDSSBlFFwOFnChcX9/ZDDHfwzZ07txeSRVQRcPiZw8/h4iImIiLLe3t7B7BaIEZEEQGHn/GYbyLUvNbW1l5IFlFEwOFnDj9jOTAJvb29mA4kiigiEA4/K6UwHTAR7t/AIcFEEUUEnLVg+NEGNMXr6fXgzcCEEEUEnLX+/v7FmAo0JXfs2DHc1dWFKUFCiBoCzlowHWiOl8vl9kKyiBoCzlp4EtA05Xneco4KQDKIGgLOWo8ePcJUoCGuAiQKAYefsQ/APKwCJAoBZ63e3l5MB5pDFSBJCDhr4VFgM7FHIFFEDQFnbfbs2ZgKNOXOnTsnIFlEDQFnbdGiRZgKNHFVABpGFBFwljKZDKYCTVxlGNXV1VWEZBFFBJylQqGAqUBz1MmTJ/+AZBFFBJyl3r17MRVo8Pz9+/exDyBhRBEBZymTyWAq0MTJQEkjigg4SzNnzsRUoCGqAO3t7ScgWUQRAWcpn89jKtDEVQZASSJqCDhLTAZTgeYolcP1AVJAtBFwlooYFTT18uXLWAFIA1FGwFnCVKAplwJnz57FFCAlRBkBZ6mjo+MMpgLNO3ny5I+QLKKMgLM0ODhYDAK8CFFxH53P54uQLKKOgLN07NgxTAWaoVQOS4FpIeoIOGvZbHYXYrxBKncmEh5/1geZCYizV/fq1YjxBikRwR6AlBFtBJy18+fP98+YMWMrYrwJeWZSWLxaKNBGtBFw1q5cubJH5aQ3COKc7f/ll1+KkDKijYCzxqfrPnv27LPguR9AfN9Rp0+f3gs1QNQRcPZYCVixYsVGxHaFmPqJwH9RfVFHwNnj/gDeE5DP5w8j9f9HXf/uu++KUCNEFwHXCIfHqBK0tLTshRj3fb9/587IXOCOaD8eoougC4L1+vU8j8vnWznnM2bM2P/ZZ0W2t7c3/HGxNgKmCJH5aBJVBF0QDZdx9/XXX389NDS0jR/39/dvUkq9VyqZC4XCLrS+NkbEEXBBUEW8q9tbL6MPP/zw9dtvv32bU8ylS5c2UVVAcMeG6CLogyFPGzjhK5fLvZrP5z+Jwg7DwcHB/UzwRYsW9YV396iiN3XrARMRcMEQjxQWP1uuXr26h3qXLVu26pVXXtkVhSWmtrYgwVcquf9z6dI2t/lLfDgCRRdB65S6vbpNqnTX+7zxRt8eGvnuu+/oe7e7Wd8OwyABttm7Uyq0qe+9914Rwk9Vy5t17oioCzqntM7ZpQBx3RJVuLVr1+6u7mH5b4NDQ0PuF4B4b4Hl3R9++OGuFStWbPT2799/Opc7tOnKlQPbt29f/s477ww9fFiRRKW2R9QRrA7J5/Ob8/l85mE21/vevXvdaEAUepznnntunZvlqK+//tplizt27Djwy0kYx1PZ55rZEUEf5ObNt+/YMfDHxYsHuru7s3W/F/PQoUOv89+8++67vfrqq/u1trZ+AhE1sjRdMlbpO3gJjCDDHf2ECbCl1CZPNB/o6ek5cOjQoW28P+AhT5mRI0eOdJeKxW1cQnw0xL+jRnmDGGDpz5vL5baxJHv77bd7dAqv6Ojo2PbrryPq22+/PRoukb179+7m8GFv7+C+CxfaSmnY87ztvb29b32yZ8+h9vb2n2fNmtUPETRMbemOiLoguH8sFovLKrdzX5c3bty4qrm5eU/cNhpeunSJ07j1+XxeZ2mv58/t7V1H7t71Z8yc+Vfr6tmTV69e7R+9e5cDlOr8+fNHOzu7Jvz7jh07+nbvfgtZf7qINKI9pHOCJwLXr1/fNPp+pVJplZuLx/UVXdq1a1cP/VUoFHQVCF9y48aNb7z77ru5qa0MjO7iCz/rrJQTYWDEcSJgOEH5a3lPcxhCnLseTildZWD36I9+/DF38+bN/ocPsJTsud9T4I/3HF+8eCEBQvyHD2NIoUYS3XY0RZWgWpJ7nmf31Zcvr5G5c5u7+1eXL1/enbUSGG95NV1SqxaZvYbD2Sl1rlbDXXRdjF+CIyrN23JcvXo1M9WBYikOHXkdHR1nnv7vL7yw5uFdE6xfuJVZ5QRPARgnDnEq/ZGKCvLf0y4T/RXXnvdhhw8cJAiuCNQZUZuAp49ozHbxM/aZ7jxPnz79mzm7dHvJvn3Dj3qHk2ZGRkYG6HtFpXrt2rVtd+8ODb/33nsvvZPJFL33378/cufOwZaWlsOVVmVGHRF1wciZM2d68Uae4/0A0P37W3f27Nmt1QnI3/H+pUuXeODJ3q++OvKxIhkcHOzGvL/+iDgC7pTq6upyiYANgu755tSpUx22VYGPdu3qLrXF0xUV56GhoXWffbYfCdBgRB0B4/v++rDxJXmPXnBh8lFuD7IhAT76aGgTV7X577179+6+NxKMIwJjItoIuCA8/OyeJXOPFrvlQEfx2kcQAcP/fvBBXzdr8T//8x+7S1UAN3LAlEcfRAUR9wmI27dvb8rkc/t5hLgUPulN1AMi+nK5nOIKwUbf9/sG3ntPqbzMHVVq365du9ZzwR2WBQ8GU9/8pUvfTVvt/OSTT9aH5Q2FMcL5/OjXfX077t69O+wS5NOnT00ot8aef+GF7qeffnqPq8DMKGH7ZH//fr7kv7zXaO7cuXu++OILuqt1mK7/vc0kQDX2jq8GjTUg79D+JA4Kqu7dnRs3bvyl6XVdrfvmm2+O7Ny5c+P777/fzWVTMzPzvf+7devTH3/8sZxV//3v/7/uyy/3/T8mcP0RcQTcJW5/wNmzZxd7njfMpURBK9Eq3QQq3HA06cmR/FxnZ+cGlxzV5Z+lheamTz/99HCpHZ4OKjr8w1+vXv0f2jR+e4NKkPaJIiKOgGtvb+/L5/OdnudxCWtmRUDd3pxTgmNt3rz588HBQbWm9DjNKHe/3kqx2dK/H1ZgWHrcY0lLly49cvny5Q38eKngvHDx4qWt5V68RnF+WUQdAecUCqNBQK8NFMvlwRh/8eLFXVeucIm7UcHAiZ6h/8nrdKk+hfk/NmOVdrjt0NFqKpvqlbIKK0JMCwKq1Uh/FP7N5f0Hm5ubS61tqOY5kcKojOojwgh4hD88PEwVzAiPUbvfhgM6TdVpcOPGjewYL9W8l19+eSMng2/fvv2Z0nDU5GoBKipHq1+ziqnzd65efeunMFl6Wlu1xhGxR8Dd4uWyLmE0JnW3b9/e6KpRXKn31ltvdfHjBw8enODRAbcPgEOC1T2+V1p98SnMm7du3Tqm8zpOAoyPqCPg7vB+gNLSWUvp+fhPP/3UydI7l8vl3n777cy8efNe5TKbBwvcvXv36LVr1/75/vvvqzNnzmwq7ecP9yqEP/eTfLlxs2a9/c033+zv+PbbekXqV0xt94hH1j6iMQxdrp11CeHyZfL06dPf+P/+7/9G//rXv6oXX3xxHUvwu3fvqvmD+sHXgQ8GYRJSAOxsP5oiDhOkP1QoFHQGCFQeHy4bGxsbw0HBiQYQjXGPUlWdJsOZfH4/93jVPe/du3e3lDqx5s2bN5w5c2YnSzGulGiVsm50W39pbeCWLVu2lpVK8hddXc1xegRoDFHdFfhFR0fHmVKiW7D9+nVexq31ufVLDJP1yT5YbGECoU7aIw6InHCKrHLacWdRUMJ6pefcJUdx38D69etXXbly5TDrBeHzs9XVnCctBZ49OybjYEfgUk0KK2oKkRvOIZ00s6ygT3yKL76kV5kUvLpGpdJYHxwe5jrWgrDXpPBkZW5ubt/169fPhP8P/a63tJS+8Pnnn1ejbRxRH6TKBDGfXl7BFt7e3q6tyjwwMHCslFVLSYrFrpw/3/nXv/519He+I1g9Gx1Ofed//ud//nPnzp2jjRKdB48MeT7P72n1agtbXlHbIgZEA1HdB0Ch5yKl1JEIJLwcH03V3t7e/3/t7e1/HikWy2XZ2rUvbP7mm29eMXl0IQufyWS2ltZxNDYgWh9OV9ETUUPApwJ9fX2vTHDUdVYrfS0OeLXXrl3bVnq95/z5XMVzpWXqD1gXevXVV/c/OhicaGGg1gn4aNDIaD7fDTFA9BFwSsVCoDQdLRYKha3h/xMeXZ756quvXq71S8E6qj/bWBVo7G6KxRLmIAZICVFCwKlA4FauDBiOa8zVXVWpVO6eO3c4zc/kGlq20KmqsBcvdoAFRBUBp0RUEj9Iu+qTK33yl9aqEVYVRNOE5aJrM6oCrQgQQ0QXAadERBJfZWPpbVNV4PXX1xA+gB0BYojoI+BUiELi+ypXpOqA8eSqQPV7NrV5qqK6xepAjJEKBJwK3ATc+Ll69b5mHxDhXYQsFTVLa5UJKxtYEBgH0UXApTSUsPT++uvfX9Ro7DYoqLl8WRMqoYMt2BFYgRQh4BRJelTg1q1bG2bMmFG9XLcqhYKqtBCqCqw6+L634datb2vzeygWu1S+xBGqACuQIgScIkmPCnz//fdvl0eLb9682RkkhpRfkbCQCR6U6Xrst66qQL63+a23/lV+0kl/2GHkQeLoQIoQcIokOipw7doj+wS4YmD8hqRQELGvKtC4d+8G9dVXn1UfDxMOCs7evh1zCRsgFQg4ZZIaFVD+6u1btmwZ4sdvvbW+64cfftjwk3BZ7ffSlltVFbj2X/7rwIFd1c/FnJqtVERGRjCH0UEqEHDKJHVIMJc9//vfv964c+dO1/Hjx+9xaZvJZA589NFH6zZv3nyEf9bd3bX5u+9+r/p3VRXhntl3S4FbVWVtDQYIMTCoA8GmSukhGZqwqbfbt1/Y96iqgK5H1BYSPA1wz1+7KhBWAL74YmVP+DH/nW+88cbeDz/88Pd//vOfB65fvz0Ml1RA7VLcH1B6vv+lLZMrBt5//z9Ob99+uOPhM73cK7D59m1UBDQRFQT8FHBqaShh6/pZdGVPwRs3bmyee3/3oZdfbmn6pJ+pOX1a8cRqCksrbVWBs2f14k+/7tq1y82KGr5cGVCFwhJ85UAD0UQK7t25s4Z3vOkm/eXLlzPFYnHRo/7W6JOIJitCnue5ykmtduwtV7pUWLcioO6q1tbJHyNnqzLRFJfDhbVn7LnMQ36kbLTm70D6EHCT4bGdLmVrNZBl1DPPzJkwe0n05zpOCjLN6pDPq4N37lxTy5ZlJ9KdaHuSbGMDXVBGykepZWb7o9Rjo84HKkwGAqbkWBjz40ePHt1WTvRXX+VpNEgkTYbT16HQMZFUzQqCFcUiLhDSQdQQXQRMM9JcWmcyHzQ1AehQKmdbVSCc1dg5DanHE5TUhd8L10TQR7QRcDTDDNXGQiG/e+bMNZMmPaXShQvndEdqK6sCBRlV3C9QiYUFdYAIIeCo/vP7bHWPXfpk3pyU9I0mw61bjz5GXMvBw8raVgXCPQGo5GsgWgg4qv2S3rLt7e2H2tralJG/JHxy8fbt29MTVAWCXYG+70+IFf5b7O3bWA2YBqKHgKP6HtjxYgqHBCuv6DRfFaigKiDGqwLVu0n3YzVgGog2Ao7qe2inyeG03bVOgEeKxS5txwrXrioQxH1QNp1QGtRNDyRGJNIbYlJA9RtvLhcxFOQtLc34VKBioFBJZVVAK1F932dZXFP8c2wOmj6ijSgjVBrXbYUEt+zcYY2qQMWQIKA8RENUEVUEXDgP1y23yxXc5s2bPxcDGD01OH1VA6oCjUVwJ02EEXBU+zl9tqXCR586jHtqsOaxhHBVYLr2BihtgoRqEogyAo6MnNbLkkz7VGGl1q7dcNjkqsDRo/8vNVWB3l5M/xuM6CNaiEZkS1IH/u8PP6gN06kK8OBC0JaPqM80ERtEB0FRE3JXr17d09LS8qnJv27duvX/2LFjx7EDB0bTdkgwRWY/B5H/jKgjWggLspAhg4XGubogzI1PnTo12aA0KsLDg/hMIxoIKBPr1q3bqJQaGBcIutKDKkDjEf0P1UF0ECqQHptvZsm5ffv2DDQe0UfAqXHixIm09vqNXjm+S6lRpAEpQMBVnJRUQUePHj2+devWnpqcpWd6GkK8kCIE3CBCJd94+P7Mmu0yzZuJ2+4ZIDVIHQIuZCokm0jyTY2XPHXqVEfEjjePN0aVlkRLx4xnKxGZM2fO+zX5IFIcqQDnEVYGGoj0JgKiF+GOt1AhdIcVVVfXocHofbS6PYK+2Fwul9MorWuu8tjyOJROVcDk3D4+nB9HxrMVsJwbhejvCQC4BQGHxxu5XE5xJWD2bL8W5UaiqgKzZ8/OaNwcI6UIuJRhUnB2FQXrgpGrAjq7XW/cuKFxVeKU6u9B+hBwCg8I6p4abKgqkM/ndRJARcPJQPVALBAQI2/evLlQd/9k5KoC586d09kBqpTKGq4KxBoB18BVgJIpSwJtVYHXXgvWBHSqCq2trVoVIGpra+vEIcF6INYIiJFffumVFYUbRrz88nNbfv5ZcwR6GqoCs2bN0qsK8KnB169fr8FxhfVAbJGxoQLCKkC9egRXVQhPDU5HVWBgYGDVo3rU8EQgHBcbf8QOmaooOHfu3C5tR4yr0Fzg+vXrm3K5nEYFJXjDkCdDw3FxvUZDYPLwBWWJn0KFVYA/2zg1uGZVgfnz53dpVF2c4Jh0TBF+4d5PGgdqd3V19eRyrGlrPzVYXRXg83dvT+NVB1VFhZN90UD4JQoVIIKmg47BwUHl+/7mZcsyGhXq8YxVBa5du3ZUoyrQpJauri5N+f4eEH2JQcBVCCcEr1R+5/UUNrKXX375QN3HmKerKlDZ8BoVGw2VvP379zdiXLCeiCUCbhycCkxHVUCjF3V0KgAbNmyAqkBikUIE3KBwRYDXArhpXbp0aX9dHx/Wtyag86hYqxcvvvOHTsLRuNm43tKpYxBfpDcREM2w54iGClRV/d49c2eDjjLt94JPn9a45XiUxvU9IBuODkQTYQE4UlqpFKcvr9XzVGJdVQFl5m/LZrPoVRuJWCPgUoIqCc4O0KkAVFQFcEJQPREbBFwKdHR0nCkUChtzubq+wqdRG1hNYdNQa2urztEB9LQFYDzFBwGXMFYCXI9tCqcGVxsZGck0ukOQg4G5nE4CqLPd3doVAMiGioKgUYhyYsKEcpLPKU2D9tVVAbO9cTgwlWwsFdFBwMWsGqAo7LFrVRWY5qpAo0K/6enp0VkFKNYxAaCBCAsSmRLNVQWCu9W/KiD4vFKCKCLgElAsFhfzycDLli1TdZ8gqEFVoLZVAZWTyVQFmpqauLSqo7OtEGMEXBKqAYnQdnagFnXgVav09gdw5+uJmCJUAmJm3bp1G5VSAzUfpq1TVSBIAJe+OTN//ny8GJQgBFyCBAn1oVJqc032CWhXBdzS48KFCzUPCebz+S01jC+OMYzVUdFBuBcgAbgSkMvlljczZ9d+OvD0VC3CU4ON1QESHBJsOI4QRQRcxHH5n5W5VHzBBE9PWgdWzVcFXGXAZKJtdJFxSyuuEdFCwEUU18IZ7sB7TM/vmF4VUKYfGRPH+MaUIeAihsP+mUymYmrwM889V+FiU2u6qgLVCYBDgiEGRA8BFyFMgqeqATxm68W2tv9O0qHHIbLVVQH+TOvpQC6X23b+/HkYi4CPM07LCUcqbL65+vTp05t1juGqXvrRqAo8//zzJmsAM5uamnQfGdaNeKQJAVdnTABVKFTM+51HJYDnpXtqcNKqAs89Z6wqMCqbzRqpb9ULsUo7Aq5OmADh2Gza1YBKw8PDNTgJTzTr7HbVga8rVGGEIyYI+DSprgLEUYVt27Z9rJ3QmlWB51/vvFo11zFcFQjL/4aCLQP9/f2rITrIFCFAGshSYPfu3a97nqexgQTFuH1VoFRNqasUXLp0qXn+/PmbIAIIlYB64HiXr8LRWmTAXetJu3aw/NhuRWJqa5z5VGeDL4rVCrFKCwIupXgr7969e41S6mPI1yxV5I3m1pTuGhfECQGHM9p27dzJ30s1w5Y5G+TiOHNNYsKnX8UNsUkUAg7SKdgh2BlWRXJu3r//+4JbtwYXD/T1LYEIIeCQAShTU+XatWs5v3q1MWWP6j9iiYBDUqsESEQUXbp0acO0/Q8xRsAhqVcCAOKGgEPSqwQAxA0Bh7xqQRDAxdEghgg4JPYqAUAUEXCJ2ywEAFGGPQGD7CglJVYEAPQQcAAAANgL0I5qAUDtcTXmziPjr1HLQsUFtjlD5sgQ/0c7SnIXHG4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACL/R/7yOwDiUJZ8QAAAABJRU5ErkJggg==";

// Type definitions
interface QuoteItem {
  treatment: string;
  priceGBP: number;
  priceUSD: number;
  quantity: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee: string;
}

interface PdfGeneratorProps {
  items: QuoteItem[];
  totalGBP: number;
  totalUSD: number;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  travelMonth?: string;
  departureCity?: string;
  onComplete?: () => void;
}

interface TableColumn {
  title: string;
  width: number;
  align: string;
}

interface ColumnPosition {
  x: number;
  width: number;
  align: string;
}

// Function to format treatment names to be more user-friendly
const formatTreatmentName = (name: string): string => {
  if (!name) return '';
  return name
    .replace(/(\w)([A-Z])/g, '$1 $2') // Add space between camelCase words
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/-/g, ' - ') // Add spaces around hyphens
    .split(' ')
    .map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize first letter of each word
    )
    .join(' ');
};

export const generateQuotePdf = ({
  items,
  totalGBP,
  totalUSD,
  patientName = '',
  patientEmail = '',
  patientPhone = '',
  travelMonth = '',
  departureCity = '',
  onComplete,
}: PdfGeneratorProps) => {
  const doc = new jsPDF();
  
  // Set up document properties
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  // Create a professional header with branding colors
  // Add a header bar
  doc.setFillColor(0, 59, 111); // Dark blue color for header background
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add a secondary accent strip
  doc.setFillColor(0, 169, 157); // Teal accent color
  doc.rect(0, 40, pageWidth, 3, 'F');
  
  // Add logo to the header (left side)
  try {
    // Add logo image
    const logoWidth = 40; // Width of the logo in mm
    const logoHeight = 25; // Height of the logo in mm
    const logoX = margin - 5; // Position X
    const logoY = 5; // Position Y
    
    // Use addImage method to add the logo
    doc.addImage(logoImageBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
  } catch (error) {
    console.error('Failed to add logo to PDF:', error);
  }
  
  // Add title with white text color for contrast against the blue background
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255); // White text on blue background
  doc.text('Treatment Quote', margin + 40, 30); // Move text to the right of the logo
  
  // Add date on the right side
  doc.setFontSize(10);
  doc.setTextColor(220, 220, 220); // Light grey
  const today = new Date().toLocaleDateString('en-GB');
  doc.text(`Quote generated on: ${today}`, pageWidth - margin, 20, { align: 'right' });
  
  // Add a contact phone number instead of an icon
  doc.setFontSize(10);
  doc.setTextColor(220, 220, 220); // Light grey
  doc.text('Contact: +447572445856', pageWidth - margin, 30, { align: 'right' });
  
  // Reset colors for the rest of the document
  doc.setDrawColor(0, 0, 0);
  doc.setTextColor(0, 0, 0);
  
  // Add patient info if available
  let yPos = 60; // Start below the header and accent strip
  if (patientName || patientEmail || patientPhone) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Patient Information:', margin, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    if (patientName) {
      doc.text(`Name: ${patientName || 'Not provided'}`, margin, yPos);
      yPos += 5;
    }
    if (patientEmail) {
      doc.text(`Email: ${patientEmail || 'Not provided'}`, margin, yPos);
      yPos += 5;
    }
    if (patientPhone) {
      doc.text(`Phone: ${patientPhone || 'Not provided'}`, margin, yPos);
      yPos += 5;
    }
    
    yPos += 7; // Space before treatments
  }
  
  // Add treatments section title with subsection for medical treatments
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('YOUR QUOTE DETAILS', margin, yPos);
  yPos += 8;
  
  // Add subsection for dental treatments
  doc.setFontSize(11);
  doc.text('Dental Treatments:', margin, yPos);
  yPos += 8;
  
  // Create a professional looking table
  const cols: TableColumn[] = [
    { title: 'Treatment', width: contentWidth * 0.35, align: 'left' },
    { title: 'Price (GBP)', width: contentWidth * 0.15, align: 'center' },
    { title: 'Price (USD)', width: contentWidth * 0.15, align: 'center' },
    { title: 'Qty', width: contentWidth * 0.1, align: 'center' },
    { title: 'Guarantee', width: contentWidth * 0.25, align: 'center' }
  ];
  
  // Calculate column positions
  let colPositions: ColumnPosition[] = [];
  let currentX = margin;
  cols.forEach(col => {
    colPositions.push({
      x: currentX,
      width: col.width,
      align: col.align
    });
    currentX += col.width;
  });
  
  // Draw table header
  doc.setFillColor(0, 59, 111); // Dark blue for header
  doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255); // White text for header
  doc.setFont('helvetica', 'bold');
  
  cols.forEach((col, index) => {
    const position = colPositions[index];
    const xPos = position.align === 'center' 
      ? position.x + position.width / 2 
      : position.x + 5;
    
    doc.text(col.title, xPos, yPos, { 
      align: position.align === 'center' ? 'center' : 'left'
    });
  });
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  
  // Add table rows
  items.forEach((item, index) => {
    // Alternate row colors
    doc.setFillColor(index % 2 === 0 ? 240 : 250, index % 2 === 0 ? 240 : 250, index % 2 === 0 ? 240 : 250);
    doc.rect(margin, yPos - 5, contentWidth, 9, 'F');
    
    // Add subtle border
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.1);
    doc.line(margin, yPos - 5, margin + contentWidth, yPos - 5);
    
    // Check if we need a new page
    if (yPos > 260) {
      doc.addPage();
      yPos = 40;
      
      // Draw header on new page
      doc.setFillColor(0, 59, 111);
      doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      
      cols.forEach((col, index) => {
        const position = colPositions[index];
        const xPos = position.align === 'center' 
          ? position.x + position.width / 2 
          : position.x + 5;
        
        doc.text(col.title, xPos, yPos, { 
          align: position.align === 'center' ? 'center' : 'left'
        });
      });
      
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
    }
    
    // Draw row content
    doc.setTextColor(0, 0, 0);
    
    // Treatment name (left aligned)
    doc.text(truncateText(formatTreatmentName(item.treatment), 40), colPositions[0].x + 5, yPos);
    
    // Price GBP (center aligned)
    doc.text(`£${item.priceGBP.toLocaleString()}`, colPositions[1].x + colPositions[1].width / 2, yPos, { align: 'center' });
    
    // Price USD (center aligned)
    doc.text(`$${item.priceUSD.toLocaleString()}`, colPositions[2].x + colPositions[2].width / 2, yPos, { align: 'center' });
    
    // Quantity (center aligned)
    doc.text(item.quantity.toString(), colPositions[3].x + colPositions[3].width / 2, yPos, { align: 'center' });
    
    // Guarantee (center aligned)
    doc.text(item.guarantee || 'N/A', colPositions[4].x + colPositions[4].width / 2, yPos, { align: 'center' });
    
    yPos += 9;
  });
  
  // Get flight estimate if provided
  let flightEstimate: number | undefined;
  if (travelMonth && departureCity) {
    flightEstimate = getFlightEstimateForCity(departureCity, travelMonth);
  }
  
  // Add flight cost row if available
  if (flightEstimate) {
    yPos += 12;
    
    // Add travel section title
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Travel Costs:', margin, yPos);
    yPos += 8;
    
    // Flight cost background (slightly different color)
    doc.setFillColor(240, 245, 255);
    doc.rect(margin, yPos - 5, contentWidth, 9, 'F');
    
    // Flight cost border
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.1);
    doc.rect(margin, yPos - 5, contentWidth, 9, 'S');
    
    // Flight description
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Return flight from ${departureCity} (${travelMonth})`, margin + 5, yPos);
    
    // Flight cost GBP (center aligned)
    doc.text(`£${flightEstimate.toLocaleString()}`, colPositions[1].x + colPositions[1].width / 2, yPos, { align: 'center' });
    
    // Flight cost USD (center aligned) - approximate conversion
    const flightUSD = Math.round(flightEstimate * 1.3); // Simple GBP to USD conversion
    doc.text(`$${flightUSD.toLocaleString()}`, colPositions[2].x + colPositions[2].width / 2, yPos, { align: 'center' });
  }
  
  // Add grand total row
  yPos += 12;
  
  // Total background
  doc.setFillColor(245, 250, 255);
  doc.rect(margin, yPos - 5, contentWidth, 12, 'F');
  
  // Total border
  doc.setDrawColor(0, 59, 111);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos - 5, contentWidth, 12, 'S');
  
  yPos += 3;
  
  // Calculate grand total with flight if applicable
  const grandTotalGBP = flightEstimate ? totalGBP + flightEstimate : totalGBP;
  const grandTotalUSD = flightEstimate ? totalUSD + Math.round(flightEstimate * 1.3) : totalUSD;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total:', margin + 10, yPos);
  
  // Total GBP (center aligned)
  doc.text(`£${grandTotalGBP.toLocaleString()}`, colPositions[1].x + colPositions[1].width / 2, yPos, { align: 'center' });
  
  // Total USD (center aligned)
  doc.text(`$${grandTotalUSD.toLocaleString()}`, colPositions[2].x + colPositions[2].width / 2, yPos, { align: 'center' });
  
  // Add footer
  yPos = 275;
  
  // Add a secondary accent strip before footer
  doc.setFillColor(0, 169, 157); // Teal accent color
  doc.rect(0, yPos - 2, pageWidth, 1, 'F');
  
  // Add footer box
  doc.setFillColor(245, 245, 245); // Light grey background
  doc.rect(0, yPos, pageWidth, 25, 'F');
  
  // Add footer content with professional styling
  yPos += 5;
  
  // Add small logo to footer
  try {
    const footerLogoWidth = 20; // Width of the logo in mm for footer
    const footerLogoHeight = 12; // Height of the logo in mm for footer
    const footerLogoX = margin; // Position X
    const footerLogoY = yPos - 4; // Position Y
    
    // Use addImage method to add the logo to footer
    doc.addImage(logoImageBase64, 'PNG', footerLogoX, footerLogoY, footerLogoWidth, footerLogoHeight);
  } catch (error) {
    console.error('Failed to add logo to PDF footer:', error);
  }
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  
  // Left side - Contact info with logo
  doc.text('Phone: +447572445856', margin + 25, yPos);
  yPos += 5;
  doc.text('Email: info@istanbuldentalsmile.com', margin + 25, yPos);
  
  // Right side - Quote validity
  doc.setFont('helvetica', 'bold');
  doc.text('Note: This quote is valid for 30 days from the issue date.', pageWidth - margin, yPos - 5, { align: 'right' });
  
  // Add flight price disclaimer if flight estimate is included
  if (flightEstimate) {
    yPos += 5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('* Flight prices are general estimates and may vary based on booking date, airline, and availability.', margin, yPos);
  }
  
  // Save the PDF
  const filename = `IstanbulDentalSmile_Quote_${today.replace(/\//g, '-')}.pdf`;
  doc.save(filename);
  
  if (onComplete) {
    onComplete();
  }
};

// Component for React usage
export default function PdfGenerator(props: PdfGeneratorProps) {
  const { t } = useTranslation();
  
  return (
    <button
      onClick={() => generateQuotePdf(props)}
      className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 font-medium text-lg transition-all duration-300 transform hover:-translate-y-1 group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 group-hover:animate-bounce" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
      </svg>
      {'Download Your Quote'}
    </button>
  );
}

// Helper function to truncate text for PDF
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}